// routes/githubAuth.ts
// GitHub OAuth for Kanvas: connect flow, encrypted token storage, auto-refresh, repo creation.
import { NextFunction, Router, type Request, type Response } from 'express';
import {
    createCipheriv,
    createDecipheriv,
    createHmac,
    randomBytes,
    timingSafeEqual,
} from 'node:crypto';


import jwt from 'jsonwebtoken';
import { PrismaClient } from "./generated/prisma/client.js";
import { increaseDesiredCapacity, redis } from './index.js';
const prisma = new PrismaClient()


// ── ADAPT these three lines to your project ─────────────────────────────────
export const getUserId = (req: Request): string =>
    (req as Request & { userId: string }).userId;
// ────────────────────────────────────────────────────────────────────────────

const router = Router();

// Read env lazily so a missing var only breaks these routes, not the whole backend boot.
const env = (key: string): string => {
    const value = process.env[key];
    if (!value) throw new Error(`Missing env var ${key}`);
    return value;
};
const middleAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = req.header('Token') as string;
        if (!token) {
            res.status(403).json({ error: "Authentication token required" })
            return;
        }
        const payload = await jwt.verify(token, process.env.SECRET_KEY as string)
        if (payload) {
            const blackListed = await redis.get(`blackList:${token}`)
            if (blackListed) {
                return res.status(401).send('Token has expired');
            }
            let temp = payload as { id: string }
            req.userId = temp.id
            next()
        } else {
            if (payload === 'TokenExpiredError') {
                return res.status(401).send('Token has expired');
            }
            return res.status(403).send('Invalid token');
        }
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: "Invalid token" });
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: "Token expired" });
        } else {
            res.status(500).json({ error: "Authentication failed" });
        }
    }
}
// ── Token encryption (AES-256-GCM) ──────────────────────────────────────────
const encKey = () => Buffer.from(env('TOKEN_ENC_KEY'), 'hex'); // 32 bytes: openssl rand -hex 32

const encrypt = (plain: string): string => {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', encKey(), iv);
    const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    return [iv, cipher.getAuthTag(), data].map((b) => b.toString('base64')).join('.');
};

const decrypt = (payload: string): string => {
    const [iv, tag, data] = payload.split('.').map((p) => Buffer.from(p, 'base64'));
    if (!iv || !tag || !data) throw new Error('Malformed ciphertext');
    const decipher = createDecipheriv('aes-256-gcm', encKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
};

// ── Signed `state` (CSRF protection + tells the callback which Kanvas user this is) ──
const sign = (data: string): string =>
    createHmac('sha256', env('SECRET_KEY')).update(`github-oauth-state:${data}`).digest('base64url');

const makeState = (userId: string, nonce: string): string => {
    const body = Buffer.from(
        JSON.stringify({ u: userId, n: nonce, e: Date.now() + 10 * 60_000 }),
    ).toString('base64url');
    return `${body}.${sign(body)}`;
};

const readState = (state: string): { u: string; n: string } | null => {
    const [body, sig] = state.split('.');
    if (!body || !sig) return null;
    const a = Buffer.from(sig);
    const b = Buffer.from(sign(body));
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
        u: string;
        n: string;
        e: number;
    };
    return data.e > Date.now() ? { u: data.u, n: data.n } : null;
};

const readCookie = (req: Request, name: string): string | undefined => {
    const hit = req.headers.cookie?.split(/;\s*/).find((c) => c.startsWith(`${name}=`));
    return hit ? decodeURIComponent(hit.slice(name.length + 1)) : undefined;
};

// ── GitHub helpers ──────────────────────────────────────────────────────────
type TokenResponse = {
    access_token: string;
    refresh_token?: string;
    expires_in?: number | string;
    refresh_token_expires_in?: number | string;
    error?: string;
    error_description?: string;
};

const ghHeaders = (token: string) => ({
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
});

// Used for both the code exchange and the refresh. GitHub returns HTTP 200 with
// an `error` field for most failures, so check both.
async function tokenRequest(params: Record<string, string>): Promise<TokenResponse> {
    const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: env('AGENT_GITHUB_CLIENT_ID'),
            client_secret: env('AGENT_GITHUB_CLIENT_SECRET'),
            ...params,
        }),
    });
    const data = (await res.json()) as TokenResponse;
    if (!res.ok || data.error || !data.access_token) {
        throw new Error(data.error ?? `GitHub token endpoint returned ${res.status}`);
    }
    return data;
}

const secondsFromNow = (s?: number | string): Date | null =>
    s ? new Date(Date.now() + Number(s) * 1000) : null;

async function saveTokens(userId: string, githubLogin: string, t: TokenResponse) {
    const data = {
        githubLogin,
        accessTokenEnc: encrypt(t.access_token),
        refreshTokenEnc: t.refresh_token ? encrypt(t.refresh_token) : null,
        accessExpiresAt: secondsFromNow(t.expires_in),
        refreshExpiresAt: secondsFromNow(t.refresh_token_expires_in),
    };
    await prisma.githubConnection.upsert({
        where: { userId },
        create: { userId, ...data },
        update: data,
    });
}

// ── Get a valid access token for a user (refreshes automatically) ───────────
// Refresh tokens rotate, so two parallel refreshes would break each other.
// This dedupes per user (fine for one backend container; use a Redis lock if you scale out).
const inflight = new Map<string, Promise<string>>();

async function loadOrRefresh(userId: string): Promise<string> {
    const row = await prisma.githubConnection.findUnique({ where: { userId } });
    if (!row) throw new Error('GITHUB_NOT_CONNECTED');

    const stillValid = !row.accessExpiresAt || row.accessExpiresAt.getTime() > Date.now() + 60_000;
    if (stillValid) return decrypt(row.accessTokenEnc);

    if (!row.refreshTokenEnc) throw new Error('GITHUB_RECONNECT');
    try {
        const t = await tokenRequest({
            grant_type: 'refresh_token',
            refresh_token: decrypt(row.refreshTokenEnc),
        });
        await saveTokens(userId, row.githubLogin, t); // saves the NEW refresh token too
        return t.access_token;
    } catch (e) {
        if (e instanceof Error && e.message === 'bad_refresh_token') {
            throw new Error('GITHUB_RECONNECT'); // expired or revoked: user must connect again
        }
        throw e;
    }
}

export const getGithubToken = (userId: string): Promise<string> => {
    let p = inflight.get(userId);
    if (!p) {
        p = loadOrRefresh(userId).finally(() => inflight.delete(userId));
        inflight.set(userId, p);
    }
    return p;
};

const back = (res: Response, status: string) => res.redirect(`${env('FRONTEND_URL')}/github/?github=${status}`);

// ── Routes ──────────────────────────────────────────────────────────────────

// 1) Frontend calls this (with your normal auth header) and then sends the browser to `url`.
//    It returns JSON instead of a 302 because a browser redirect can't carry an Authorization header.
router.get('/auth/github/url', middleAuth, (req, res) => {
    try {
        const nonce = randomBytes(16).toString('hex');
        // Binds this flow to this browser, so a link crafted by someone else can't attach their account to yours.
        res.cookie('gh_oauth', nonce, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 10 * 60_000,
        });
        const url = new URL('https://github.com/login/oauth/authorize');
        url.search = new URLSearchParams({
            client_id: env('AGENT_GITHUB_CLIENT_ID'),
            redirect_uri: env('AGENT_GITHUB_CALLBACK_URL'),
            scope: 'repo', // use 'public_repo' if you only support public repos
            state: makeState(getUserId(req), nonce),
        }).toString();
        res.json({ url: url.toString() });
    } catch (e) {
        console.error('GitHub connect failed:', e instanceof Error ? e.message : e);
        res.status(500).json({ error: 'GitHub connect is not configured' });
    }
});

// 2) GitHub redirects the browser here after the user approves.
router.get('/auth/github/callback', async (req, res) => {
    try {
        const { code, state, error } = req.query as Record<string, string | undefined>;
        if (error || !code || !state) {
            back(res, 'denied');
            return;
        }

        const s = readState(state);
        if (!s || s.n !== readCookie(req, 'gh_oauth')) {
            back(res, 'invalid_state');
            return;
        }
        res.clearCookie('gh_oauth');

        const tokens = await tokenRequest({ code, redirect_uri: env('AGENT_GITHUB_CALLBACK_URL') });

        const me = await fetch('https://api.github.com/user', { headers: ghHeaders(tokens.access_token) });
        const profile = (await me.json()) as { login?: string };
        if (!me.ok || !profile.login) throw new Error('Could not read GitHub profile');

        await saveTokens(s.u, profile.login, tokens);
        back(res, 'connected');

        // AI Agent
    } catch (e) {
        console.error('GitHub callback failed:', e instanceof Error ? e.message : e); // never log tokens
        back(res, 'error');
    }
});

// 3) For the UI: show "Connect GitHub" or "Connected as @login".
router.get('/github/status', middleAuth, async (req, res) => {
    const row = await prisma.githubConnection.findUnique({ where: { userId: getUserId(req) } });
    res.json({ connected: Boolean(row), login: row?.githubLogin ?? null });
});

// ================= ASSIGN MACHINE FUNCTION - DUPLICATE ==================
async function assignMachine(userId: string, projName: string, proType: string, res: Response, req: Request) {
    const cacheKey = `cache:user:${userId!}: projects`;
    try {
        console.log("\n\n")
        console.log("******************* ASSIGN METHOD ***************")

        await redis.del(cacheKey);
        const user = await prisma.user.findFirst({
            where: {
                id: userId as unknown as string
            }, include: {
                projects: true
            }
        })
        if (user) {
            if (user.id) {
                const projects = await prisma.project.findMany({ where: { userId: user?.id } })
                if (projects.length! >= user?.maxProject!) {
                    res.status(405).json({
                        message: "Free plan limit reached. Either delete a project or upgrade to premium.",
                    })
                    return
                }
                let aiCurrentCount = 0;
                projects.map((elem) => {
                    if (elem.projectType == 'AI') {
                        aiCurrentCount = aiCurrentCount + 1;
                    }
                })
                if (proType == 'AI' && aiCurrentCount >= user.maxAiProjectCnt) {
                    res.status(405).json({
                        message: "Free plan AI Project limit reached. Either delete a AI project or upgrade to premium.",
                    })
                    return
                }
                let machine;
                let machinePublicDNSName;
                const ALL_INSTANCES = await redis.smembers('ALL_INSTANCES')
                let newProject = null
                for (const instanceId of ALL_INSTANCES) {
                    const claimed = await redis.hsetnx(`ALL_MACHINES:${instanceId}`, "userId", userId!);
                    if (claimed === 1) {
                        const singleMachine = await redis.hgetall(`ALL_MACHINES:${instanceId}`)
                        if (Object.keys(singleMachine).length === 0) {
                            await redis.hdel(`ALL_MACHINES:${instanceId}`, "userId")
                            continue;
                        }
                        machinePublicDNSName = singleMachine.publicDnsName!
                        newProject = await prisma.project.create({
                            data: {
                                ip: singleMachine.ip!,
                                publicDnsName: singleMachine.publicDnsName!,
                                s3Key: "",
                                instanceId: singleMachine.instanceId!,
                                isUsed: true,
                                projectType: proType as string,
                                assignedAt: new Date().toISOString(),
                                userId: userId!,
                                projectName: projName as string,
                            }
                        })
                        machine = {
                            ...singleMachine,
                            isUsed: "true",
                            projectType: proType as string,
                            assignedAt: new Date().toISOString(),
                            userId: userId!,
                            lastHeartBeat: Date.now().toString(),
                            projectName: projName as string,
                            projectId: newProject.id,
                            instanceId: singleMachine.instanceId
                        };

                        await redis.hset(`ALL_MACHINES:${instanceId}`, machine);
                        break
                    }
                }
                if (machine === undefined) {
                    let usedMachines = 0
                    for (const instanceId of ALL_INSTANCES) {
                        const singleMachine = await redis.hgetall(`ALL_MACHINES:${instanceId}`)
                        if (Object.keys(singleMachine).length === 0)
                            continue;
                        if (singleMachine.isUsed == 'true') {
                            usedMachines += 1;
                        }
                    }
                    increaseDesiredCapacity(usedMachines + 2)
                    res.status(405).json({
                        message: "We're spinning up a workspace for you, please wait 30 seconds and try again"
                    })
                    return
                }
                const token = await getGithubToken(userId);
                fetch(`http://${machinePublicDNSName}:9095/git-clone`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token, fullName: projName, userId: machine.userId, projectId: machine.projectId })
                })
                let usedMachines = 0
                for (const instanceId of ALL_INSTANCES) {
                    const singleMachine = await redis.hgetall(`ALL_MACHINES:${instanceId}`)
                    if (Object.keys(singleMachine).length === 0)
                        continue;
                    if (singleMachine.isUsed == 'true') {
                        usedMachines += 1;
                    }
                }
                increaseDesiredCapacity(usedMachines + 2)
                res.json({ machine, name: projName })
                return
            }
        }
    } catch (error) {
        console.error('Assign project:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
}



// 4) Create an empty repo on the user's GitHub. Returns the clone URL for the agent.
router.post('/github/repo', middleAuth, async (req, res) => {
    const { name, isPrivate = true } = (req.body ?? {}) as { name?: string; isPrivate?: boolean };
    if (!name || !/^[A-Za-z0-9._-]{1,100}$/.test(name)) {
        res.status(400).json({ error: 'Invalid repo name' });
        return;
    }

    try {
        const token = await getGithubToken(getUserId(req));
        const r = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: { ...ghHeaders(token), 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, private: isPrivate, auto_init: false }),
        });

        if (r.status === 422) {
            res.status(409).json({ error: 'A repo with this name already exists' });
            return;
        }
        if (r.status === 401) {
            res.status(401).json({ error: 'GITHUB_RECONNECT' });
            return;
        }
        if (!r.ok) {
            res.status(502).json({ error: 'GitHub rejected the request' });
            return;
        }
        const repo = (await r.json()) as { clone_url: string; html_url: string; full_name: string };
        return assignMachine(req.userId!, repo.full_name, "AI Agent", res, req)
        // res.json({ cloneUrl: repo.clone_url, htmlUrl: repo.html_url, fullName: repo.full_name });
    } catch (e) {
        if (e instanceof Error && (e.message === 'GITHUB_NOT_CONNECTED' || e.message === 'GITHUB_RECONNECT')) {
            res.status(401).json({ error: e.message }); // frontend should show "Connect GitHub"
            return;
        }
        console.error('Create repo failed:', e instanceof Error ? e.message : e);
        res.status(500).json({ error: 'Failed to create repo' });
    }
});

// ======================= FETCH ALL REPOS ==========================
router.get('/github/repos', middleAuth, async (req, res) => {
    try {
        const token = await getGithubToken(getUserId(req));
        const page = Number(req.query.page) || 1;

        const r = await fetch(
            `https://api.github.com/user/repos?per_page=30&page=${page}&sort=pushed&affiliation=owner,collaborator`,
            { headers: ghHeaders(token) },
        );
        if (r.status === 401) { res.status(401).json({ error: 'GITHUB_RECONNECT' }); return; }
        if (!r.ok) { res.status(502).json({ error: 'GitHub rejected the request' }); return; }

        const repos = (await r.json()) as any[];
        // send only what the UI needs
        res.json(repos.map((x) => ({
            fullName: x.full_name,
            private: x.private,
            defaultBranch: x.default_branch,
            pushedAt: x.pushed_at,
        })));
    } catch (e) {
        if (e instanceof Error && (e.message === 'GITHUB_NOT_CONNECTED' || e.message === 'GITHUB_RECONNECT')) {
            res.status(401).json({ error: e.message });
            return;
        }
        res.status(500).json({ error: 'Failed to list repos' });
    }
});

export default router;