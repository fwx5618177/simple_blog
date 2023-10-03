import inquirer from "inquirer";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dayjs from "dayjs";
import baseJson from "../../docs/base.json" assert { type: "json" };

// 获取当前文件的 URL
const currentFileURL = import.meta.url;

// 将 URL 转换为文件路径
const currentFilePath = fileURLToPath(currentFileURL);

// 获取文件所在的目录路径
const __dirname = dirname(currentFilePath);

class DocFiles {
  constructor() {}

  async createFile() {
    const responses = await inquirer.prompt([
      { type: "input", name: "fileName", message: "File name?" },
      { type: "input", name: "title", message: "Doc title?" },
      {
        type: "input",
        name: "tags",
        message: "Tags? separator is (,), like: zk,know, so on",
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
    const mdDir = responses.dirName ? path.join(dir, responses.dirName) : dir;
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

      fs.writeFileSync(filePath, `# ${responses.title}\n\n${responses.tags}`);

      baseJson.push({
        title: responses.title,
        location: filePath,
        tags: responses.tags.split(","),
      });
    });

    fs.writeFileSync(baseJsonPath, JSON.stringify(baseJson, null, 2));
    console.log("File created successfully!");
  }
}

export default DocFiles;
