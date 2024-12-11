import * as core from "@actions/core";

function main(options, action, ...args) {
    console.log(action, args, options);
}

export default main;