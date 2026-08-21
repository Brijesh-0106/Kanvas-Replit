export const cloneTree = (tree: any) => structuredClone(tree);

export const getNode = (tree: any, path: any) => {
  if (!path || path === "project" || path === "." || path === "./") return tree;

  return path.split("/").reduce((node: any, key: any) => node?.[key], tree);
};

export const addFile = (tree: any, folderPath: any, fileName: any) => {
  const updatedTree = cloneTree(tree);
  const target = getNode(updatedTree, folderPath);
  console.log(updatedTree)
  console.log(target)
  if (!target) throw new Error("Folder not found");

  if (target[fileName]) throw new Error("File already exists");

  target[fileName] = {
    file: {
      contents: "",
    },
  };

  return updatedTree;
};

export const addFolder = (tree: any, folderPath: any, folderName: any) => {
  const updatedTree = cloneTree(tree);

  const target = getNode(updatedTree, folderPath);

  if (!target) throw new Error("Folder not found");

  if (target[folderName]) throw new Error("Folder already exists");

  target[folderName] = {};

  return updatedTree;
};

export const renameNode = (tree: any, path: any, newName: any) => {
  const updatedTree = cloneTree(tree);

  const parts = path.split("/");
  const oldName = parts.pop();

  const parent = getNode(updatedTree, parts.join("/"));

  if (!parent) throw new Error("Parent folder not found");

  parent[newName] = parent[oldName];
  delete parent[oldName];

  return updatedTree;
};

export const deleteNode = (tree: any, path: any) => {
  const updatedTree = cloneTree(tree);

  const parts = path.split("/");
  const nodeName = parts.pop();

  const parent = getNode(updatedTree, parts.join("/"));

  if (!parent) throw new Error("Parent folder not found");

  delete parent[nodeName];

  return updatedTree;
};