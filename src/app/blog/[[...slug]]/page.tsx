import Paper from "@/components/Paper";
import dayjs from "dayjs";

export default function Page({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const { slug } = params;

  return (
    <main>
      <Paper title={"关于我"} time={dayjs().toString()} pageSize="sm">
        <article className={`relative w-full`}></article>
      </Paper>
    </main>
  );
}
