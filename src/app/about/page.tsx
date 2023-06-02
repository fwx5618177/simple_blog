"use client";

import Paper from "@/components/Paper";
import { aboutMock } from "@/mock/about.mock";
import dayjs from "dayjs";
import styles from "@/styles/style.module.scss";
import useAlert from "@/hooks/useAlert";

export default function Page() {
  const { alertSuccess, alertFailed } = useAlert();

  return (
    <main>
      <Paper title={"关于我"} time={dayjs().toString()} pageSize="sm">
        <article className={`relative w-full`}>
          <ul className="px-[3rem] leading-8 text-fourth text-about font-about">
            {aboutMock?.map((item, index) => {
              return (
                <li key={index} className={`relative ${styles.listItem}`}>
                  {item}
                </li>
              );
            })}
          </ul>
          <h2
            className={`my-10 py-2 text-left text-title text-primary border-b-[1px] border-b-solid border-b-default`}
          >
            参与的项目
          </h2>
          <div className="min-h-[20vh] flex flex-row items-center justify-center gap-5 py-6">
            <button
              onClick={() => {
                alertSuccess("success");
              }}
              className="px-4 py-2 font-bold rounded text-default bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/50"
            >
              RSS
            </button>
            <button
              onClick={() => {
                alertFailed("Error");
              }}
              className="px-4 py-2 font-bold bg-indigo-500 rounded text-default hover:bg-indigo-600 shadow-indigo-500/50"
            >
              Contact
            </button>
          </div>
          <div className="relative w-full bottom-0 before:content-[''] before:absolute before:w-full before:h-[1px] before:m-0 before:top-[-10px] before:left-0 before:bg-hrLine">
            1222
          </div>
        </article>
      </Paper>
    </main>
  );
}
