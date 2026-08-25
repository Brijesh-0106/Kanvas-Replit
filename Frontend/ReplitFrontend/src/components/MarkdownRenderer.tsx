import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FiCheck, FiCopy } from "react-icons/fi";

interface CodeBlockProps {
    language: string;
    value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative my-3 rounded-lg overflow-hidden border border-zinc-800 bg-[#1e1e1e]">
            {/* Code Header Bar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-zinc-800 text-xs text-zinc-400 font-mono">
                <span>{language || "text"}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-zinc-700"
                >
                    {copied ? (
                        <>
                            <FiCheck className="text-emerald-400" size={13} />
                            <span className="text-emerald-400">Copied!</span>
                        </>
                    ) : (
                        <>
                            <FiCopy size={13} />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Syntax Highlighted Code */}
            <SyntaxHighlighter
                language={language || "text"}
                style={vscDarkPlus}
                customStyle={{
                    margin: 0,
                    padding: "0.85rem",
                    fontSize: "0.82rem",
                    background: "transparent",
                }}
                wrapLongLines={true}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
};

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    return (
        <div className="text-sm leading-relaxed text-[#d4d4d4]">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => <h1 className="text-lg font-bold text-zinc-100 mt-4 mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-semibold text-zinc-100 mt-3.5 mb-1.5">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold text-zinc-200 mt-3 mb-1">{children}</h3>,
                    p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-outside pl-5 space-y-1.5 my-2 text-zinc-300">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-outside pl-5 space-y-2.5 my-2 text-zinc-300">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-zinc-100">{children}</strong>,
                    code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const isInline = !match && !String(children).includes("\n");

                        if (isInline) {
                            return (
                                <code className="inline px-1.5 py-0.5 mx-0.5 rounded bg-zinc-800 text-amber-400 text-xs font-mono border border-zinc-700/80">
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <CodeBlock
                                language={match ? match[1] : ""}
                                value={String(children).replace(/\n$/, "")}
                            />
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};
