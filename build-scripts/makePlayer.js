'use strict';
const fs = require('fs');
const HTMLParser = require('node-html-parser');

let rawbipsi = fs.readFileSync("data/bipsi.json");
let rawhtml = fs.readFileSync("binksi/editor.html");
let inkstory = fs.readFileSync("data/story.ink.json");

if(inkstory.toString().charCodeAt(0) != 123){ //not a "{"
    inkstory = inkstory.toString().substring(1);
}

const document = HTMLParser.parse(rawhtml);
const bundle = JSON.parse(rawbipsi);
const story = JSON.parse(inkstory);

document.querySelectorAll("[data-editor-only]").forEach((element) => element.remove());
document.setAttribute("data-app-mode", "player");
document.querySelector("#player").removeAttribute("hidden");
document.querySelector("#bundle-embed").innerHTML = JSON.stringify(bundle);
document.querySelector("#story-embed").innerHTML = JSON.stringify(story);

fs.writeFileSync("dist/player.html", document.toString());