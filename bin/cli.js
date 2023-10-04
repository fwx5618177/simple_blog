#!/usr/bin/env node

import { program } from "commander";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import pkg from "../package.json" assert { type: "json" };
import Main from "./lib/main.js";

const main = new Main();

program.addHelpText(
  "beforeAll",
  `\t\t\t\t\t${chalk.bgRed(pkg.name)}\n\n\t\t\t${chalk.bgGreenBright(
    `It's helpful to write docs and check them`
  )}\n\n`
);

program
  .version(
    pkg.version,
    "-v, --version",
    `Output the current version of ${pkg.name}.`
  )
  .name(pkg.name)
  .usage("<command> [options] [arguments]");

program
  .command("new")
  .description("Create a new markdown file.")
  .action(async () => {
    await main.getPlugin("docFiles").createFile();
  });

program
  .command("delete")
  .description(`Delete the file from base.json and docs files.`)
  .action(async () => {
    await main.getPlugin("docFiles").deleteFile();
  });

program
  .command("check")
  .description("Check if the base.json and docs are matching.")
  .action(async () => {
    await main.getPlugin("docFiles").Check();
  });

program
  .command("upload")
  .option("-d, --destination <type>", "Specify the upload destination.")
  .description("Upload files to a specific location.")
  .action(() => {
    // TODO: Implement file upload logic here
    console.log("Uploading files...");
  });

if (process.argv.length < 1) {
  program.outputHelp();
  process.exit(0);
}

program.parse(process.argv);
