import inquirer from "inquirer";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dayjs from "dayjs";
import baseJson from "../../docs/base.json" assert { type: "json" };
import chalk from "chalk";

// 获取当前文件的 URL
const currentFileURL = import.meta.url;

// 将 URL 转换为文件路径
const currentFilePath = fileURLToPath(currentFileURL);

// 获取文件所在的目录路径
const __dirname = dirname(currentFilePath);

class DocFiles {
  constructor() {}

  fileList() {
    return fs.readdirSync(path.join(__dirname, "../../docs"));
  }

  async deleteFile() {
    const list = this.fileList();

    const responses = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmDelete",
        message: `Are you sure you want to delete file?`,
      },
      {
        type: "list",
        name: "file",
        message: "Please select a template file:",
        choices: list,
        when: (answers) => answers.confirmDelete,
        validate: (input) => {
          if (input.trim() === "") return "The file name cannot be empty!";
          return true;
        },
      },
    ]);

    // todo: delete file
  }

  async Check() {
    baseJson.forEach((file) => {
      if (!fs.existsSync(file.path)) {
        console.log(
          chalk.bgRed(
            `Error: File ${file.title} does not exist at ${file.path}`
          )
        );
      }
    });

    console.log(chalk.greenBright("Check completed!"));
  }

  async createFile() {
    const responses = await inquirer.prompt([
      { type: "input", name: "fileName", message: "File name?" },
      { type: "input", name: "title", message: "Doc title?" },
      {
        type: "input",
        name: "tags",
        message: "Tags? separator is (,), like: zk,know, so on:",
        default: "none",
      },
      {
        type: "confirm",
        name: "createDir",
        message: "Create a new directory?",
      },
      {
        type: "input",
        name: "dirName",
        message: "Directory name?",
        default: "default",
        when: (answers) => answers.createDir,
      },
      {
        type: "confirm",
        name: "isMultilingual",
        when: (answers) => answers.createDir,
        message: "Is the document multilingual?",
      },
      {
        type: "checkbox",
        name: "languages",
        message: "Select languages",
        choices: ["zh", "jp", "en", "fr"],
        when: (answers) => answers.isMultilingual,
      },
    ]);

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const dir = path.join(__dirname, "../../", `docs/${year}/${month}`);
    const mdDir = responses.createDir ? path.join(dir, responses.dirName) : dir;
    const languages = responses.isMultilingual ? responses.languages : [""];
    const baseJsonPath = path.join(__dirname, "../../docs/base.json");

    if (!fs.existsSync(mdDir)) {
      fs.mkdirSync(mdDir, { recursive: true });
    }

    languages.forEach((language) => {
      const suffix = language ? `_${language}` : "";
      const fileName = `${responses.fileName}_${dayjs().format(
        "YYYYMMDD"
      )}${suffix}.md`;
      const filePath = path.join(mdDir, fileName);
      const locationPath = path.relative(process.cwd(), filePath);
      fs.writeFileSync(filePath, `# ${responses.title}\n\n${responses.tags}`);

      baseJson.push({
        title: `【${language}】responses.title`,
        path: locationPath,
        tags: responses.tags.split(","),
      });
    });

    fs.writeFileSync(baseJsonPath, JSON.stringify(baseJson, null, 2));
    console.log("File created successfully!");
  }
}

export default DocFiles;
