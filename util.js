const axios = require('axios');
const atob = require('atob');
const GITHUB_API = "https://api.github.com/repos";

const mysecretobjectpleasedontsteal = {
  client_id: '7b75ed090eaf22c7e569',
  client_secret: '5d300934fe6df77cfe1a9768b93f5b80422fe8f1'
};

var self = module.exports = {
  getProject: async (projectUrl) => {
    let trimmed = self.trimGithubUrl(projectUrl);
    let res = await axios.get(`${GITHUB_API}/${trimmed}/git/trees/master`, {
      params: mysecretobjectpleasedontsteal
    });
    let trees = res.data.tree;
    return self.traverseTree(trees);
  },


  traverseTree: async (trees) => {
    let fileTree = {};

    for (let tree of trees) {
          if (tree.type === 'blob' && tree.path.endsWith('.js')) {
            let res = await axios.get(tree.url , {
              params: mysecretobjectpleasedontsteal
            });
            let contents = atob(res.data.content);
            fileTree[tree.path] = contents; //todo linter shit
          } else if (tree.type === 'tree') {
            let res = await axios.get(tree.url, {
              params: mysecretobjectpleasedontsteal
            });
            fileTree[tree.path] = self.traverseTree(res.data.tree);
          }
    }
    return fileTree;
  },

  trimGithubUrl: (projectUrl) => {
    let pre = 'https://github.com/';
    return projectUrl.substr(projectUrl.indexOf(pre) + pre.length);
  },
};

