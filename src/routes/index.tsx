import { createFileRoute } from "@tanstack/react-router";
import GameScene from "../game/Scene";

export const Route = createFileRoute("/")({
  component: GameScene,
  head: () => ({
    meta: [
      { title: "Harvest Haven — Your Little World" },
      { name: "description", content: "An interactive isometric farming and town-building world." },
    ],
  }),
});
