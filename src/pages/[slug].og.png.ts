import { getCollection } from "astro:content";
import fs from "node:fs";
import satori from "satori";
import sharp from "sharp";

import type { APIRoute } from "astro";
import type { SatoriOptions } from "satori";

export const GET: APIRoute = async function get({ props }) {
  const element = {
    type: "div",
    props: {
      style: {
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 100,
        backgroundColor: "#181825",
        color: "#cdd6f4",
        fontSize: 100,
      },
      children: [
        {
          type: "div",
          props: {
            children: props.title,
          },
        },
      ],
    },
  };
  const options: SatoriOptions = {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Geist",
        data: fs.readFileSync("./public/Geist-Medium.ttf"),
        weight: 500,
        style: "normal",
      },
    ],
  };
  const svg = await satori(element, options);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  const pngUint8Array = new Uint8Array(pngBuffer);

  return new Response(pngUint8Array, {
    headers: { "Content-Type": "image/png" },
  });
};

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: {
      title: post.data.title,
    },
  }));
}
