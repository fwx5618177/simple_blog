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
      { type: "input", name: "tags", message: "Tags?" },
    ]);

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const dir = path.join(__dirname, `docs/${year}/${month}`);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(
      dir,
      `${responses.fileName}_${dayjs().format("YYYYMMDD")}.md`
    );
    fs.writeFileSync(filePath, `# ${responses.fileName}\n\n${responses.tags}`);

    const baseJsonPath = path.join(__dirname, "docs/base.json");

    baseJson.push({
      title: responses.title,
      location: filePath,
      tags: responses.tags.split(","),
    });
    fs.writeFileSync(baseJsonPath, JSON.stringify(baseJson, null, 2));
    console.log("File created successfully!");
  }
}

export default DocFiles;
