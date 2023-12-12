export interface Room {
  id: string;
  url: string;
  ppi: number;
  anchor: {
    x: number;
    y: number;
  };
}

const rooms: Room[] = [
  {
    id: "3eef6afa-ad8d-4d3f-b8b7-157752620389",
    url: "https://images.unsplash.com/photo-1540518614846-7eded433c457?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1157&q=80",
    ppi: NaN,
    anchor: {
      x: 390,
      y: 160,
    },
  },
  {
    id: "90cbafd0-1f6d-462f-b74e-d7f67a306815",
    url: "https://images.unsplash.com/photo-1598928636135-d146006ff4be?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    ppi: NaN,
    anchor: {
      x: 390,
      y: 160,
    },
  },
  {
    id: "59255404-414a-4a0c-84e5-2c7c2db01164",
    url: "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80",
    ppi: NaN,
    anchor: {
      x: 390,
      y: 160,
    },
  },
  {
    id: "8562e5cd-9569-4f60-9e39-39741e6f179f",
    url: "https://images.unsplash.com/photo-1561049933-c8fbef47b329?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=765&q=80",
    ppi: NaN,
    anchor: {
      x: 390,
      y: 160,
    },
  },
  {
    id: "be465f11-a0b3-4f15-9e71-d7ad35adad51",
    url: "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=958&q=80",
    ppi: NaN,
    anchor: {
      x: 390,
      y: 160,
    },
  },
  {
    id: "7c1bb85e-e2cc-4178-b61a-68ddfd49d3e9",
    url: "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
    ppi: NaN,
    anchor: {
      x: 390,
      y: 160,
    },
  },
  {
    id: "baad3553-58eb-4733-9d0c-eda6527a5748",
    url: "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=765&q=80",
    ppi: NaN,
    anchor: {
      x: 390,
      y: 160,
    },
  },
  {
    id: "8e639261-90b7-4056-834b-f88e21e60b0a",
    url: "https://images.unsplash.com/photo-1552558636-f6a8f071c2b3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80",
    ppi: NaN,
    anchor: {
      x: 390,
      y: 160,
    },
  },
];

export interface RoomViewState {
  rooms: Room[];
  roomId: string;
  productId: string;
}

export const defaultValue: RoomViewState = {
  rooms: rooms,
  roomId: rooms[0].id,
  productId: "",
};
