// Gameplay data only: items, crops, recipes, buildings, prices, levels.
// Edit values here without touching rendering.

export type ItemId =
  | "wheat" | "corn" | "carrot" | "sugarcane" | "cotton"
  | "milk" | "egg"
  | "cow_feed" | "chicken_feed" | "bread" | "cookie" | "cream" | "cheese" | "sugar" | "fabric" | "sweater";

export interface ItemDef { name: string; value: number; color: string; kind: "crop" | "animal" | "goods" }

export const ITEMS: Record<ItemId, ItemDef> = {
  wheat: { name: "Wheat", value: 2, color: "#e8c25a", kind: "crop" },
  corn: { name: "Corn", value: 4, color: "#f2d23c", kind: "crop" },
  carrot: { name: "Carrot", value: 6, color: "#f0802c", kind: "crop" },
  sugarcane: { name: "Sugarcane", value: 8, color: "#9bc95a", kind: "crop" },
  cotton: { name: "Cotton", value: 10, color: "#f4f1ea", kind: "crop" },
  milk: { name: "Milk", value: 12, color: "#ffffff", kind: "animal" },
  egg: { name: "Egg", value: 10, color: "#f6e7c8", kind: "animal" },
  cow_feed: { name: "Cow Feed", value: 6, color: "#c99a5b", kind: "goods" },
  chicken_feed: { name: "Chicken Feed", value: 5, color: "#d9b26a", kind: "goods" },
  bread: { name: "Bread", value: 10, color: "#c8843d", kind: "goods" },
  cookie: { name: "Cookies", value: 24, color: "#a86a34", kind: "goods" },
  cream: { name: "Cream", value: 22, color: "#fff4d6", kind: "goods" },
  cheese: { name: "Cheese", value: 30, color: "#f7c948", kind: "goods" },
  sugar: { name: "Sugar", value: 20, color: "#f7f7f7", kind: "goods" },
  fabric: { name: "Fabric", value: 28, color: "#6aa6d8", kind: "goods" },
  sweater: { name: "Sweater", value: 50, color: "#d65a5a", kind: "goods" },
};

export interface CropDef { item: ItemId; time: number; level: number }
// time in seconds. Planting uses 1 from the barn, harvest returns CROP_YIELD.
export const CROPS: CropDef[] = [
  { item: "wheat", time: 30, level: 1 },
  { item: "corn", time: 60, level: 1 },
  { item: "carrot", time: 90, level: 2 },
  { item: "sugarcane", time: 120, level: 3 },
  { item: "cotton", time: 150, level: 4 },
];
export const CROP_YIELD = 2;

export interface Recipe { id: string; inputs: Partial<Record<ItemId, number>>; output: ItemId; qty: number; time: number; level: number }

export type BuildingKind = "field" | "producer" | "animal" | "storage" | "house" | "community" | "decor" | "orders" | "transport";
export type Category = "farm" | "industry" | "housing" | "community" | "decor" | "transport";

export interface BuildingDef {
  id: string;
  name: string;
  category: Category;
  kind: BuildingKind;
  w: number; // footprint along x
  h: number; // footprint along y
  cost: number;
  level: number;
  buildable: boolean; // shown in shop
  movable: boolean;
  removable: boolean;
  population?: number;
  storage?: number;
  recipes?: Recipe[];
  parallel?: boolean; // animal buildings run all slots at once
  slots?: number; // queue length (or animal count)
  orderSource?: OrderSource;
  desc: string;
}

export type OrderSource = "board" | "train" | "ship" | "plane";

const R = (id: string, inputs: Recipe["inputs"], output: ItemId, qty: number, time: number, level: number): Recipe =>
  ({ id, inputs, output, qty, time, level });

export const BUILDINGS: Record<string, BuildingDef> = {
  // Farm
  field: { id: "field", name: "Field", category: "farm", kind: "field", w: 1, h: 1, cost: 10, level: 1, buildable: true, movable: true, removable: true, desc: "Plant crops and harvest twice what you sow." },
  barn: { id: "barn", name: "Barn", category: "farm", kind: "storage", w: 2, h: 2, cost: 0, level: 1, buildable: false, movable: true, removable: false, storage: 80, desc: "Stores crops and goods." },
  cowshed: { id: "cowshed", name: "Cowshed", category: "farm", kind: "animal", w: 2, h: 3, cost: 150, level: 1, buildable: true, movable: true, removable: true, parallel: true, slots: 3, recipes: [R("milk", { cow_feed: 1 }, "milk", 1, 60, 1)], desc: "Feed the cows to get milk." },
  coop: { id: "coop", name: "Chicken Coop", category: "farm", kind: "animal", w: 2, h: 2, cost: 120, level: 2, buildable: true, movable: true, removable: true, parallel: true, slots: 3, recipes: [R("egg", { chicken_feed: 1 }, "egg", 1, 45, 2)], desc: "Feed the chickens to collect eggs." },
  feedmill: { id: "feedmill", name: "Feed Mill", category: "industry", kind: "producer", w: 2, h: 2, cost: 100, level: 1, buildable: true, movable: true, removable: true, slots: 3, recipes: [R("cow_feed", { wheat: 1, corn: 1 }, "cow_feed", 3, 20, 1), R("chicken_feed", { wheat: 2 }, "chicken_feed", 3, 15, 2)], desc: "Turns grain into animal feed." },
  // Industry
  bakery: { id: "bakery", name: "Bakery", category: "industry", kind: "producer", w: 2, h: 2, cost: 200, level: 1, buildable: true, movable: true, removable: true, slots: 3, recipes: [R("bread", { wheat: 3 }, "bread", 1, 30, 1), R("cookie", { wheat: 2, egg: 1, sugar: 1 }, "cookie", 1, 60, 4)], desc: "Bakes bread and cookies." },
  dairy: { id: "dairy", name: "Dairy Factory", category: "industry", kind: "producer", w: 2, h: 3, cost: 350, level: 2, buildable: true, movable: true, removable: true, slots: 3, recipes: [R("cream", { milk: 1 }, "cream", 1, 40, 2), R("cheese", { milk: 2 }, "cheese", 1, 70, 3)], desc: "Makes cream and cheese from milk." },
  sugar: { id: "sugar", name: "Sugar Factory", category: "industry", kind: "producer", w: 2, h: 2, cost: 400, level: 3, buildable: true, movable: true, removable: true, slots: 3, recipes: [R("sugar", { sugarcane: 2 }, "sugar", 1, 50, 3)], desc: "Refines sugarcane into sugar." },
  textile: { id: "textile", name: "Textile Mill", category: "industry", kind: "producer", w: 3, h: 3, cost: 600, level: 4, buildable: true, movable: true, removable: true, slots: 3, recipes: [R("fabric", { cotton: 2 }, "fabric", 1, 60, 4), R("sweater", { fabric: 1, cotton: 1 }, "sweater", 1, 90, 5)], desc: "Weaves cotton into fabric and sweaters." },
  warehouse: { id: "warehouse", name: "Warehouse", category: "industry", kind: "storage", w: 2, h: 2, cost: 300, level: 2, buildable: true, movable: true, removable: true, storage: 40, desc: "Adds storage space." },
  // Housing
  cottage: { id: "cottage", name: "Cottage", category: "housing", kind: "house", w: 1, h: 1, cost: 60, level: 1, buildable: true, movable: true, removable: true, population: 4, desc: "A cosy home for 4 townsfolk." },
  townhouse: { id: "townhouse", name: "Townhouse", category: "housing", kind: "house", w: 1, h: 2, cost: 110, level: 1, buildable: true, movable: true, removable: true, population: 8, desc: "Narrow three-storey home." },
  house: { id: "house", name: "Family House", category: "housing", kind: "house", w: 2, h: 2, cost: 180, level: 2, buildable: true, movable: true, removable: true, population: 12, desc: "Two-storey family house with garden." },
  apartment: { id: "apartment", name: "Apartments", category: "housing", kind: "house", w: 2, h: 2, cost: 320, level: 3, buildable: true, movable: true, removable: true, population: 24, desc: "Five floors of apartments." },
  villa: { id: "villa", name: "Villa", category: "housing", kind: "house", w: 2, h: 3, cost: 450, level: 4, buildable: true, movable: true, removable: true, population: 16, desc: "Villa with a private pool." },
  // Community
  shop: { id: "shop", name: "General Store", category: "community", kind: "community", w: 2, h: 2, cost: 200, level: 1, buildable: true, movable: true, removable: true, desc: "Local shop with striped awning." },
  cafe: { id: "cafe", name: "Café", category: "community", kind: "community", w: 2, h: 2, cost: 220, level: 2, buildable: true, movable: true, removable: true, desc: "Terrace café." },
  school: { id: "school", name: "School", category: "community", kind: "community", w: 3, h: 3, cost: 500, level: 3, buildable: true, movable: true, removable: true, desc: "School with bell tower and yard." },
  townhall: { id: "townhall", name: "Town Hall", category: "community", kind: "community", w: 3, h: 3, cost: 0, level: 1, buildable: false, movable: true, removable: false, desc: "Heart of your town." },
  park: { id: "park", name: "Park", category: "community", kind: "community", w: 2, h: 2, cost: 150, level: 1, buildable: true, movable: true, removable: true, desc: "Fountain, benches and flower beds." },
  // Decor
  tree: { id: "tree", name: "Oak Tree", category: "decor", kind: "decor", w: 1, h: 1, cost: 5, level: 1, buildable: true, movable: true, removable: true, desc: "Leafy tree." },
  pine: { id: "pine", name: "Pine Tree", category: "decor", kind: "decor", w: 1, h: 1, cost: 5, level: 1, buildable: true, movable: true, removable: true, desc: "Evergreen pine." },
  flowers: { id: "flowers", name: "Flower Bed", category: "decor", kind: "decor", w: 1, h: 1, cost: 15, level: 1, buildable: true, movable: true, removable: true, desc: "Colourful flowers." },
  // Transport / fixed
  orders: { id: "orders", name: "Order Board", category: "transport", kind: "orders", w: 2, h: 1, cost: 0, level: 1, buildable: false, movable: true, removable: false, orderSource: "board", desc: "Townsfolk orders. Deliver goods for coins." },
  station: { id: "station", name: "Train Station", category: "transport", kind: "transport", w: 3, h: 2, cost: 0, level: 1, buildable: false, movable: false, removable: false, orderSource: "train", desc: "Load cargo onto the train." },
  hangar: { id: "hangar", name: "Airport Hangar", category: "transport", kind: "transport", w: 2, h: 2, cost: 0, level: 1, buildable: false, movable: false, removable: false, orderSource: "plane", desc: "Air freight with bigger rewards." },
  tower: { id: "tower", name: "Control Tower", category: "transport", kind: "decor", w: 1, h: 1, cost: 0, level: 1, buildable: false, movable: false, removable: false, desc: "Airport control tower." },
  harbor: { id: "harbor", name: "Harbor Office", category: "transport", kind: "transport", w: 2, h: 2, cost: 0, level: 1, buildable: false, movable: false, removable: false, orderSource: "ship", desc: "Ship cargo overseas." },
  crane: { id: "crane", name: "Harbor Crane", category: "transport", kind: "decor", w: 1, h: 1, cost: 0, level: 1, buildable: false, movable: false, removable: false, desc: "Loads containers onto ships." },
  containers: { id: "containers", name: "Containers", category: "transport", kind: "decor", w: 1, h: 1, cost: 0, level: 1, buildable: false, movable: false, removable: false, desc: "Cargo containers." },
};

export const ROAD_COST = 10;
export const UPGRADE_SLOT_COST = 150; // per extra queue slot
export const BARN_UPGRADE = { cost: 200, add: 20 };
export const EXPANSION_BASE_COST = 500;
export const EXPANSION_STEP = 400;

// Rewards for orders by source
export const ORDER_RULES: Record<OrderSource, { count: number; coinMul: number; xpMul: number; label: string }> = {
  board: { count: 3, coinMul: 1.3, xpMul: 0.5, label: "Order Board" },
  train: { count: 2, coinMul: 1.5, xpMul: 0.6, label: "Train" },
  ship: { count: 2, coinMul: 1.7, xpMul: 0.7, label: "Ship" },
  plane: { count: 2, coinMul: 2.0, xpMul: 0.8, label: "Air freight" },
};

export const LEVEL_XP = [0, 25, 70, 150, 270, 440, 680, 1000, 1400, 1900, 2500];
export const HARVEST_XP = 1;
export const START = { coins: 600, storage: { wheat: 6, corn: 4, cow_feed: 3 } as Partial<Record<ItemId, number>> };
