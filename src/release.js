import * as core from "@actions/core";

class Release {
    #context = JSON.parse(core.getInput("context"));
    #token = core.getInput("token");
    #ref = core.getInput("ref");

    async create(options, ...args) {
        console.log(options, args);
    }
}

const release = new Release();

export default release;