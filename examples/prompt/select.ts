#!/usr/bin/env -S deno run

import { Select } from "@cliffy/prompt/select";

const title: string = await Select.prompt({
  message: "Pick a book",
  search: true,
  searchMode: "all",
  maxBreadcrumbItems: 2,
  options: [
    {
      name: "Fantasy",
      options: [
        {
          name: "Harry Potter",
          options: [
            "Harry Potter and the Philosopher's Stone",
            "Harry Potter and the Chamber of Secrets",
            "Harry Potter and the Prisoner of Azkaban",
            "Harry Potter and the Goblet of Fire",
            "Harry Potter and the Order of the Phoenix",
            "Harry Potter and the Half-Blood Prince",
            "Harry Potter and the Deathly Hallows",
          ],
        },
        {
          name: "Middle-Earth",
          options: [
            "The Hobbit",
            {
              name: "The Lord of the Rings",
              options: [
                "The Fellowship of the Ring",
                "The Two Towers",
                "The Return of the King",
              ],
            },
            "Silmarillion",
          ],
        },
      ],
    },
    {
      name: "Young Adult",
      options: [
        {
          name: "The Hunger Games-series",
          options: [
            "The Hunger Games",
            "Catching Fire",
            "Mockingjay",
            "The Ballad of Songbirds and Snakes",
          ],
        },
        "The Fault in Our Stars",
      ],
    },
    {
      name: "Classic",
      options: [
        "Moby-Dick",
        "Pride and Prejudice",
        "To Kill a Mockingbird",
        "Brave New World",
      ],
    },
  ],
});

console.log({ title });
