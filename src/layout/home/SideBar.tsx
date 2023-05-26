import Image from "next/image";

const menuList = [
  {
    name: "首页",
    path: "/",
  },
  {
    name: "归档",
    path: "/archive",
  },
  {
    name: "分类",
    path: "/category",
  },
  {
    name: "标签",
    path: "/tag",
  },
  {
    name: "关于",
    path: "/about",
  },
];

const SideBar = () => {
  return (
    <div className="w-[300px] bg-[#fff]">
      <div>
        <div className="aw-full h-[200px] bg-[#4d4d4d]"></div>
        <div className="mt-[-75px]">
          <div className="h-[200px] w-full flex items-center justify-center">
            <div className="w-[80%] h-full flex items-center justify-center">
              <a className="w-[200px] h-[200px] rounded-[50%] my-0 mx-[auto] border-[5px] border-[#fff]">
                <Image
                  priority
                  src="/fatBlack.JPG"
                  alt=""
                  width={200}
                  height={200}
                  className="h-full w-full rounded-[50%] object-cover rotate-[20deg] transform-gpu hover:rotate-0 transition-all duration-500 ease-in-out cursor-pointer"
                />
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto my-0 text-center">
          <hgroup className="text-title text-primary">
            <a href="/">莫西博客</a>
          </hgroup>
          <p className="text-secondary text-ellipsis my-[2rem] text-lg">
            “踏踏实实做事”
          </p>
        </div>

        <nav className="text-center text-secondary">
          <ul>
            {menuList?.map((item, index) => (
              <li key={index} className="py-2 text-sm hover:text-hoverPrimary">
                <a href={item?.path}>{item?.name}</a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="text-sm my-[2rem] flex justify-center gap-2 text-secondary">
          <a className="hover:text-hoverPrimary" href="/recommend">
            推荐
          </a>
          /
          <a className="hover:text-hoverPrimary" href="/search">
            搜索
          </a>
          {">>"}
        </nav>

        <nav className="flex justify-center gap-2 text-secondary">
          <a>github</a>
          <a>1</a>
          <a>1</a>
        </nav>
      </div>
    </div>
  );
};

export default SideBar;
