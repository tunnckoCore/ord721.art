import React from "react";

interface Props {
  href: string;
  frontmatter?: any;
}

export default function Card({ href, frontmatter }: Props) {
  const datetimeISO = frontmatter.pubDatetime.toISOString();
  return (
    <li className="my-6">
      <a
        href={href}
        className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        <h3 className="text-lg font-medium decoration-dashed hover:underline">
          {frontmatter.title}
        </h3>
      </a>

      <p className="pt-2">{frontmatter.description}</p>
    </li>
  );
}

/*

<!-- <div class="my-2 flex items-center space-x-2 opacity-80">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="inline-block h-6 w-6 scale-100 fill-skin-base"
        aria-hidden="true"
      >
        <path
          d="M7 11h2v2H7zm0 4h2v2H7zm4-4h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z"
        ></path>
        <path
          d="M5 22h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM19 8l.001 12H5V8h14z"
        ></path>
      </svg>
      <span class="sr-only">Posted on:</span>
      <span class="text-base italic">
        <time datetime={datetimeISO} title={datetimeISO}>
          {
            new Date(frontmatter.pubDatetime).toLocaleDateString("en-us", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          }
        </time>
      </span>
    </div> -->

*/
