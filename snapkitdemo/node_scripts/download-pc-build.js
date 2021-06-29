const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const Zip = require('adm-zip');
const request = require('request-promise');

const config = {
    "projectName": "Snapkit Plugin Demo",
    "bearer": "9ggsl48nzt6jo9xlfck7sc39u2dlgju0",
    "projectId": "771129",
    "sceneIds": [
        "1103781"
    ],
    "branchId": "c3f7a283-a801-474f-8dc9-039ee4cb4ef7"
}

var buildJobId = "";

function downloadProject() {
    var body = {
        method: 'POST',
        body: JSON.stringify({
            "project_id": parseInt(config.projectId),
            "name": config.projectName,
            "scenes": config.sceneIds.map(s => parseInt(s)),
            "branch_id": config.branchId,
            "scripts_concatenate": true,
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.bearer
        }
    };

    console.log("✔ Requested build from Playcanvas");
    return new Promise(function (resolve, reject) {
        fetch('https://playcanvas.com/api/apps/download', body)
            .then(res => res.json())
            .then(json => buildJobId = json.id)
            .then(pollBuildJob)
            .then(json => {
                console.log("✔ Downloading zip", json.download_url);
                return fetch(json.download_url, { method: 'GET' })
            })
            .then(res => res.buffer())
            .then(buffer => {
                let output = path.resolve(process.cwd() + '/temp/build.zip');
                if (!fs.existsSync(path.dirname(output))) {
                    fs.mkdirSync(path.dirname(output), { recursive: true });
                }
                fs.writeFileSync(output, buffer, 'binary')
                resolve(output);
            })
    });
}

function pollBuildJob() {
    console.log("↪ Polling build job ", buildJobId)
    return new Promise(async function (resolve, reject) {
        var complete = false;
        var error = false;
        var data = "";
        while (!complete && !error) {
            var json = "";
            await request({
                uri: 'https://playcanvas.com/api/jobs/' + buildJobId,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + config.bearer
                }
            })
                .then(res => json = JSON.parse(res))
                .catch((e) => {
                    error = true;
                    data = e.message;
                });
            if (json.status == "complete") {
                console.log("✔ Build job complete!",)
                data = json.data;
                complete = true;
            } else if (json.status == "error") {
                console.log(" build job error ", json.messages)
                data = json.messages.join(';');
                error = true;
            } else if (json.status == "running") {
                console.log(" build job still running");
                await sleep(1000)
            }
        }
        if (complete) {
            resolve(data);
        }
        else {
            reject(data);
        }
    });
}

function unzipProject(zipLocation) {
    return new Promise((resolve, reject) => {
        console.log('✔ Unzipping ', zipLocation);
        var zipFile = new Zip(zipLocation);
        try {
            var tempFolder = path.resolve(path.dirname(zipLocation), './../www/');
            if (fs.existsSync(tempFolder)) {
                fs.rmdirSync(tempFolder, { recursive: true });
            }
            fs.mkdirSync(tempFolder);
            zipFile.extractAllTo(tempFolder, true);
            var outputFile = path.resolve(tempFolder, 'index.html');
            fs.rmdirSync(zipLocation, { recursive: true });
            resolve(outputFile);
        } catch (e) {
            reject(e);
        }
    });
}

function addCordovaScriptToIndexFile() {
    return new Promise((resolve, reject) => {
        console.log("Adding cordova.js to index.html");

        var indexPath = path.resolve("www", "index.html");
        fs.readFile(indexPath, (readError, data) => {
            if (readError) {
                reject(readError);
            } else {
                var fileContents = data.toString();
                fileContents = fileContents.replace("</body>", "<script src=\"cordova.js\"></script>\n</body>");

                fs.writeFile(indexPath, fileContents, (writeError) => {
                    if (writeError)
                        reject(writeError);
                    else
                        resolve();
                });
            }
        });
    })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var propgateRejection = (e) => { return Promise.reject(e) };

downloadProject()
    .then(unzipProject, propgateRejection)
    .then(addCordovaScriptToIndexFile, propgateRejection)
    .then(null, e => console.log(e));