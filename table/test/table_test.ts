import { test } from "@cliffy/internal/testing/test";
import { Table } from "../table.ts";
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { Row } from "../row.ts";
import { Column } from "../column.ts";

test("simple table", () => {
  assertEquals(
    Table.from([
      ["cell1", "cell2", "cell3"],
      ["cell1", "cell2", "cell3"],
      ["cell1", "cell2", "cell3"],
    ])
      .padding(1)
      .toString(),
    `
cell1 cell2 cell3
cell1 cell2 cell3
cell1 cell2 cell3`.slice(1),
  );
});

test("simple table from table", () => {
  assertEquals(
    Table.from(
      new Table()
        .header(["1", "2", "3"])
        .body([
          ["cell1", "cell2", "cell3"],
          ["cell1", "cell2", "cell3"],
          ["cell1", "cell2", "cell3"],
        ]),
    )
      .padding(1)
      .toString(),
    `
1     2     3    
cell1 cell2 cell3
cell1 cell2 cell3
cell1 cell2 cell3`.slice(1),
  );
});

test("simple table from json", () => {
  assertEquals(
    Table.fromJson([{
      firstName: "foo",
      lastName: "bar",
      age: "3",
    }, {
      firstName: "foo",
      lastName: "bar",
      age: "44",
    }, {
      firstName: "foo",
      lastName: "bar",
      age: "132",
    }])
      .padding(1)
      .toString(),
    `
firstName lastName age
foo       bar      3  
foo       bar      44 
foo       bar      132`.slice(1),
  );
});

test("clone simple table", () => {
  const table1 = Table.from([
    ["cell1", "cell2", "cell3"],
    ["cell1", "cell2", "cell3"],
    ["cell1", "cell2", "cell3"],
  ]).padding(1);
  const table2 = table1.clone();
  const table3 = table2.clone();
  assertEquals(table2, table3);
  assertThrows(() => assertStrictEquals(table2, table3), Error);
});

test("table getter", () => {
  const header = Row.from(["1", "2", "3"]).border(false);
  const table = new Table()
    .header(header)
    .body([
      ["cell1", "cell2", "cell3"],
      ["cell1", "cell2", "cell3"],
      ["cell1", "cell2", "cell3"],
    ])
    .minColWidth(3)
    .maxColWidth(10)
    .indent(2)
    .padding(4)
    .border();
  assertEquals(table.getHeader(), header);
  assertEquals(table.getBody(), [
    ["cell1", "cell2", "cell3"],
    ["cell1", "cell2", "cell3"],
    ["cell1", "cell2", "cell3"],
  ]);
  assertEquals(table.getMinColWidth(), 3);
  assertEquals(table.getMaxColWidth(), 10);
  assertEquals(table.getIndent(), 2);
  assertEquals(table.getPadding(), 4);
  assertEquals(table.hasBorder(), true);
  assertEquals(table.hasBodyBorder(), true);
  assertEquals(table.hasHeaderBorder(), false);
});

test("simple table with min col with", () => {
  assertEquals(
    Table.from([
      ["cell1", "cell2", "cell3"],
      ["cell1", "cell2", "cell3"],
      ["cell1", "cell2", "cell3"],
    ])
      .indent(2)
      .indent(5, false)
      .minColWidth(10)
      .minColWidth(20, false)
      .padding(1)
      .padding(10, false)
      .toString(),
    `
  cell1      cell2      cell3     
  cell1      cell2      cell3     
  cell1      cell2      cell3     `.slice(1),
  );
});

test("simple table with word break", () => {
  assertEquals(
    Table.from([
      ["cell1", "cell2 cell2", "cell3"],
      ["cell1", "cell2", "cell3"],
      ["cell1", "cell2", "cell3 cell3"],
    ])
      .maxColWidth(4)
      .maxColWidth(20, false)
      .padding(1)
      .toString(),
    `
cell cell cell
1    2    3   
     cell     
     2        
cell cell cell
1    2    3   
cell cell cell
1    2    3   
          cell
          3   `.slice(1),
  );
});

test("simple border table", () => {
  assertEquals(
    Table.from([
      ["cell1", "cell2", "cell3"],
      ["cell1", "cell2", "cell3"],
      ["cell1", "cell2", "cell3"],
    ])
      .border()
      .border(false, false)
      .toString(),
    `
┌───────┬───────┬───────┐
│ cell1 │ cell2 │ cell3 │
├───────┼───────┼───────┤
│ cell1 │ cell2 │ cell3 │
├───────┼───────┼───────┤
│ cell1 │ cell2 │ cell3 │
└───────┴───────┴───────┘`.slice(1),
  );
});

test("simple nested table", () => {
  assertEquals(
    Table.from([[
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(1)
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(1)
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(1)
        .toString(),
    ], [
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(1)
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(1)
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(1)
        .toString(),
    ], [
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(1)
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(1)
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(1)
        .toString(),
    ]])
      .padding(1)
      .toString(),
    `
cell1 cell2 cell3 cell1 cell2 cell3 cell1 cell2 cell3
cell1 cell2 cell3 cell1 cell2 cell3 cell1 cell2 cell3
cell1 cell2 cell3 cell1 cell2 cell3 cell1 cell2 cell3
cell1 cell2 cell3 cell1 cell2 cell3 cell1 cell2 cell3
cell1 cell2 cell3 cell1 cell2 cell3 cell1 cell2 cell3
cell1 cell2 cell3 cell1 cell2 cell3 cell1 cell2 cell3
cell1 cell2 cell3 cell1 cell2 cell3 cell1 cell2 cell3
cell1 cell2 cell3 cell1 cell2 cell3 cell1 cell2 cell3
cell1 cell2 cell3 cell1 cell2 cell3 cell1 cell2 cell3`.slice(1),
  );
});

test("simple nested border table", () => {
  assertEquals(
    Table.from([[
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(0)
        .border()
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(0)
        .border()
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(0)
        .border()
        .toString(),
    ], [
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(0)
        .border()
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(0)
        .border()
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(0)
        .border()
        .toString(),
    ], [
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(0)
        .border()
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(0)
        .border()
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(0)
        .border()
        .toString(),
    ]])
      .padding(1)
      .toString(),
    `
┌─────┬─────┬─────┐ ┌─────┬─────┬─────┐ ┌─────┬─────┬─────┐
│cell1│cell2│cell3│ │cell1│cell2│cell3│ │cell1│cell2│cell3│
├─────┼─────┼─────┤ ├─────┼─────┼─────┤ ├─────┼─────┼─────┤
│cell1│cell2│cell3│ │cell1│cell2│cell3│ │cell1│cell2│cell3│
├─────┼─────┼─────┤ ├─────┼─────┼─────┤ ├─────┼─────┼─────┤
│cell1│cell2│cell3│ │cell1│cell2│cell3│ │cell1│cell2│cell3│
└─────┴─────┴─────┘ └─────┴─────┴─────┘ └─────┴─────┴─────┘
┌─────┬─────┬─────┐ ┌─────┬─────┬─────┐ ┌─────┬─────┬─────┐
│cell1│cell2│cell3│ │cell1│cell2│cell3│ │cell1│cell2│cell3│
├─────┼─────┼─────┤ ├─────┼─────┼─────┤ ├─────┼─────┼─────┤
│cell1│cell2│cell3│ │cell1│cell2│cell3│ │cell1│cell2│cell3│
├─────┼─────┼─────┤ ├─────┼─────┼─────┤ ├─────┼─────┼─────┤
│cell1│cell2│cell3│ │cell1│cell2│cell3│ │cell1│cell2│cell3│
└─────┴─────┴─────┘ └─────┴─────┴─────┘ └─────┴─────┴─────┘
┌─────┬─────┬─────┐ ┌─────┬─────┬─────┐ ┌─────┬─────┬─────┐
│cell1│cell2│cell3│ │cell1│cell2│cell3│ │cell1│cell2│cell3│
├─────┼─────┼─────┤ ├─────┼─────┼─────┤ ├─────┼─────┼─────┤
│cell1│cell2│cell3│ │cell1│cell2│cell3│ │cell1│cell2│cell3│
├─────┼─────┼─────┤ ├─────┼─────┼─────┤ ├─────┼─────┼─────┤
│cell1│cell2│cell3│ │cell1│cell2│cell3│ │cell1│cell2│cell3│
└─────┴─────┴─────┘ └─────┴─────┴─────┘ └─────┴─────┴─────┘`.slice(1),
  );
});

test("multiline table", () => {
  assertEquals(
    Table.from([
      [
        "Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
        "cell2",
        "cell3",
      ],
      [
        "cell1",
        "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
        "cell3",
      ],
      [
        "cell1",
        "cell2",
        "At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
      ],
    ])
      .padding(1)
      .maxColWidth(20)
      .toString(),
    `
Stet clita kasd cell2             cell3         
gubergren, no                                   
sea takimata                                    
sanctus est                                     
Lorem ipsum                                     
dolor sit amet.                                 
cell1           Lorem ipsum dolor cell3         
                sit amet,                       
                consetetur                      
                sadipscing elitr,               
                sed diam nonumy                 
                eirmod tempor                   
                invidunt ut                     
                labore et dolore                
                magna aliquyam                  
                erat, sed diam                  
                voluptua.                       
cell1           cell2             At vero eos et
                                  accusam et    
                                  justo duo     
                                  dolores et ea 
                                  rebum. Stet   
                                  clita kasd    
                                  gubergren, no 
                                  sea takimata  
                                  sanctus est   
                                  Lorem ipsum   
                                  dolor sit     
                                  amet.         `.slice(1),
  );
});

test("multiline border table", () => {
  assertEquals(
    Table.from([
      [
        "Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
        "cell2",
        "cell3",
      ],
      [
        "cell1",
        "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
        "cell3",
      ],
      [
        "cell1",
        "cell2",
        "At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
      ],
    ])
      .padding(0)
      .maxColWidth(20)
      .border()
      .toString(),
    `
┌───────────────┬─────────────────┬──────────────┐
│Stet clita kasd│cell2            │cell3         │
│gubergren, no  │                 │              │
│sea takimata   │                 │              │
│sanctus est    │                 │              │
│Lorem ipsum    │                 │              │
│dolor sit amet.│                 │              │
├───────────────┼─────────────────┼──────────────┤
│cell1          │Lorem ipsum dolor│cell3         │
│               │sit amet,        │              │
│               │consetetur       │              │
│               │sadipscing elitr,│              │
│               │sed diam nonumy  │              │
│               │eirmod tempor    │              │
│               │invidunt ut      │              │
│               │labore et dolore │              │
│               │magna aliquyam   │              │
│               │erat, sed diam   │              │
│               │voluptua.        │              │
├───────────────┼─────────────────┼──────────────┤
│cell1          │cell2            │At vero eos et│
│               │                 │accusam et    │
│               │                 │justo duo     │
│               │                 │dolores et ea │
│               │                 │rebum. Stet   │
│               │                 │clita kasd    │
│               │                 │gubergren, no │
│               │                 │sea takimata  │
│               │                 │sanctus est   │
│               │                 │Lorem ipsum   │
│               │                 │dolor sit     │
│               │                 │amet.         │
└───────────────┴─────────────────┴──────────────┘`.slice(1),
  );
});

test("nested multiline border table", () => {
  assertEquals(
    Table.from([[
      Table.from([
        ["sed diam nonumy eirmod tempor invidunt ut labore.", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(1)
        .maxColWidth(20)
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        [
          "cell1",
          "Lorem ipsum dolor sit amet, consetetur sadipscing elitr.",
          "cell3",
        ],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(1)
        .maxColWidth(20)
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(1)
        .maxColWidth(20)
        .toString(),
    ], [
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["takimata sanctus est Lorem ipsum.", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(1)
        .maxColWidth(20)
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["Stet clita kasd gubergren, no sea takimata.", "cell2", "cell3"],
      ])
        .padding(1)
        .maxColWidth(20)
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "sanctus est Lorem ipsum dolor sit."],
      ])
        .padding(1)
        .maxColWidth(20)
        .toString(),
    ], [
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["sed diam nonumy eirmod tempor invidunt ut labore.", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(1)
        .maxColWidth(20)
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "accusam et justo duo."],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(1)
        .maxColWidth(20)
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["Stet clita kasd gubergren, no sea takimata.", "cell2", "cell3"],
      ])
        .padding(1)
        .maxColWidth(20)
        .toString(),
    ]])
      .padding(1)
      .toString(),
    `
sed diam nonumy cell2 cell3      cell1 cell2             cell3 cell1 cell2 cell3            
eirmod tempor                    cell1 Lorem ipsum dolor cell3 cell1 cell2 cell3            
invidunt ut                            sit amet,               cell1 cell2 cell3            
labore.                                consetetur                                           
cell1           cell2 cell3            sadipscing elitr.                                    
cell1           cell2 cell3      cell1 cell2             cell3                              
cell1                cell2 cell3 cell1           cell2 cell3   cell1 cell2 cell3            
takimata sanctus est cell2 cell3 cell1           cell2 cell3   cell1 cell2 cell3            
Lorem ipsum.                     Stet clita kasd cell2 cell3   cell1 cell2 sanctus est Lorem
cell1                cell2 cell3 gubergren, no                             ipsum dolor sit. 
                                 sea takimata.                                              
cell1           cell2 cell3      cell1 cell2 cell3             cell1           cell2 cell3  
sed diam nonumy cell2 cell3      cell1 cell2 accusam et justo  cell1           cell2 cell3  
eirmod tempor                                duo.              Stet clita kasd cell2 cell3  
invidunt ut                      cell1 cell2 cell3             gubergren, no                
labore.                                                        sea takimata.                
cell1           cell2 cell3                                                                 `
      .slice(1),
  );
});

test("nested multiline border table", () => {
  assertEquals(
    Table.from([[
      Table.from([
        ["sed diam nonumy eirmod tempor invidunt ut labore.", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(0)
        .maxColWidth(20)
        .border()
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        [
          "cell1",
          "Lorem ipsum dolor sit amet, consetetur sadipscing elitr.",
          "cell3",
        ],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(0)
        .maxColWidth(20)
        .border()
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(0)
        .maxColWidth(20)
        .border()
        .toString(),
    ], [
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["takimata sanctus est Lorem ipsum.", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(0)
        .maxColWidth(20)
        .border()
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["Stet clita kasd gubergren, no sea takimata.", "cell2", "cell3"],
      ])
        .padding(0)
        .maxColWidth(20)
        .border()
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "sanctus est Lorem ipsum dolor sit."],
      ])
        .padding(0)
        .maxColWidth(20)
        .border()
        .toString(),
    ], [
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["sed diam nonumy eirmod tempor invidunt ut labore.", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(0)
        .maxColWidth(20)
        .border()
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "accusam et justo duo."],
        ["cell1", "cell2", "cell3"],
      ])
        .padding(0)
        .maxColWidth(20)
        .border()
        .toString(),
      Table.from([
        ["cell1", "cell2", "cell3"],
        ["cell1", "cell2", "cell3"],
        ["Stet clita kasd gubergren, no sea takimata.", "cell2", "cell3"],
      ])
        .padding(0)
        .maxColWidth(20)
        .border()
        .toString(),
    ]])
      .padding(1)
      .toString(),
    `
┌───────────────┬─────┬─────┐      ┌─────┬─────────────────┬─────┐ ┌─────┬─────┬─────┐            
│sed diam nonumy│cell2│cell3│      │cell1│cell2            │cell3│ │cell1│cell2│cell3│            
│eirmod tempor  │     │     │      ├─────┼─────────────────┼─────┤ ├─────┼─────┼─────┤            
│invidunt ut    │     │     │      │cell1│Lorem ipsum dolor│cell3│ │cell1│cell2│cell3│            
│labore.        │     │     │      │     │sit amet,        │     │ ├─────┼─────┼─────┤            
├───────────────┼─────┼─────┤      │     │consetetur       │     │ │cell1│cell2│cell3│            
│cell1          │cell2│cell3│      │     │sadipscing elitr.│     │ └─────┴─────┴─────┘            
├───────────────┼─────┼─────┤      ├─────┼─────────────────┼─────┤                                
│cell1          │cell2│cell3│      │cell1│cell2            │cell3│                                
└───────────────┴─────┴─────┘      └─────┴─────────────────┴─────┘                                
┌────────────────────┬─────┬─────┐ ┌───────────────┬─────┬─────┐   ┌─────┬─────┬─────────────────┐
│cell1               │cell2│cell3│ │cell1          │cell2│cell3│   │cell1│cell2│cell3            │
├────────────────────┼─────┼─────┤ ├───────────────┼─────┼─────┤   ├─────┼─────┼─────────────────┤
│takimata sanctus est│cell2│cell3│ │cell1          │cell2│cell3│   │cell1│cell2│cell3            │
│Lorem ipsum.        │     │     │ ├───────────────┼─────┼─────┤   ├─────┼─────┼─────────────────┤
├────────────────────┼─────┼─────┤ │Stet clita kasd│cell2│cell3│   │cell1│cell2│sanctus est Lorem│
│cell1               │cell2│cell3│ │gubergren, no  │     │     │   │     │     │ipsum dolor sit. │
└────────────────────┴─────┴─────┘ │sea takimata.  │     │     │   └─────┴─────┴─────────────────┘
                                   └───────────────┴─────┴─────┘                                  
┌───────────────┬─────┬─────┐      ┌─────┬─────┬────────────────┐  ┌───────────────┬─────┬─────┐  
│cell1          │cell2│cell3│      │cell1│cell2│cell3           │  │cell1          │cell2│cell3│  
├───────────────┼─────┼─────┤      ├─────┼─────┼────────────────┤  ├───────────────┼─────┼─────┤  
│sed diam nonumy│cell2│cell3│      │cell1│cell2│accusam et justo│  │cell1          │cell2│cell3│  
│eirmod tempor  │     │     │      │     │     │duo.            │  ├───────────────┼─────┼─────┤  
│invidunt ut    │     │     │      ├─────┼─────┼────────────────┤  │Stet clita kasd│cell2│cell3│  
│labore.        │     │     │      │cell1│cell2│cell3           │  │gubergren, no  │     │     │  
├───────────────┼─────┼─────┤      └─────┴─────┴────────────────┘  │sea takimata.  │     │     │  
│cell1          │cell2│cell3│                                      └───────────────┴─────┴─────┘  
└───────────────┴─────┴─────┘                                                                     `
      .slice(1),
  );
});

test("table with padding", () => {
  assertEquals(
    Table.from([
      [
        "Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
        "cell2",
        "cell3",
      ],
      [
        "cell1",
        "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt.",
        "cell3",
      ],
      [
        "cell1",
        "cell2",
        "At vero eos et accusam et justo duo dolores et ea rebum.",
      ],
    ])
      .padding(5)
      .maxColWidth(20)
      .toString(),
    `
Stet clita kasd     cell2                 cell3         
gubergren, no                                           
sea takimata                                            
sanctus est                                             
Lorem ipsum                                             
dolor sit amet.                                         
cell1               Lorem ipsum dolor     cell3         
                    sit amet,                           
                    consetetur                          
                    sadipscing elitr,                   
                    sed diam nonumy                     
                    eirmod tempor                       
                    invidunt.                           
cell1               cell2                 At vero eos et
                                          accusam et    
                                          justo duo     
                                          dolores et ea 
                                          rebum.        `.slice(1),
  );
});

test("should shrink all columns proportionally when maxWidth is set", () => {
  assertEquals(
    Table.from([
      ["JavaScript", "TypeScript"],
    ])
      .padding(1)
      .maxWidth(14)
      .flexShrink()
      .toString(),
    `\
JavaSc TypeSc
ript   ript  `,
  );
});

test("should keep rigid columns unchanged when flexShrink is set per column", () => {
  assertEquals(
    Table.from([
      ["--env", "sets the runtime environment"],
    ])
      .padding(1)
      .maxWidth(22)
      .flexShrink([0, 1])
      .toString(),
    `\
--env sets the runtime
      environment     `,
  );
});

test("should redistribute slack to other flex columns when minColWidth clamps one", () => {
  assertEquals(
    Table.from([
      ["--config", "path/to/config.json"],
    ])
      .padding(1)
      .maxWidth(18)
      .minColWidth([7, 0])
      .flexShrink()
      .toString(),
    `\
--confi path/to/co
g       nfig.json `,
  );
});

test("should respect Column.flexShrink when set via Column API", () => {
  assertEquals(
    Table.from([
      ["--output", "production"],
    ])
      .padding(1)
      .maxWidth(15)
      .flexShrink()
      .column(0, new Column().flexShrink(0))
      .toString(),
    `\
--output produc
         tion  `,
  );
});

test("should not shrink columns when content already fits within maxWidth", () => {
  assertEquals(
    Table.from([
      ["--host", "localhost"],
      ["--port", "8080"],
    ])
      .padding(1)
      .maxWidth(20)
      .toString(),
    `\
--host localhost
--port 8080     `,
  );
});

test("should not shrink columns when all have flexShrink set to 0", () => {
  assertEquals(
    Table.from([
      ["--output", "--source"],
    ])
      .padding(1)
      .maxWidth(10)
      .flexShrink(0)
      .toString(),
    "--output --source",
  );
});

test("should apply shrink consistently across multiple rows", () => {
  assertEquals(
    Table.from([
      ["--global", "--silent"],
      ["on", "off"],
    ])
      .padding(1)
      .maxWidth(12)
      .flexShrink()
      .toString(),
    `\
--glo --sil
bal   ent  
on    off  `,
  );
});

test("should shrink columns in a bordered table", () => {
  assertEquals(
    Table.from([
      ["redis", "kafka"],
    ])
      .border()
      .maxWidth(15)
      .flexShrink()
      .toString(),
    `\
┌──────┬──────┐
│ redi │ kafk │
│ s    │ a    │
└──────┴──────┘`,
  );
});

test("should expand a column to fill available space when flexGrow is set", () => {
  assertEquals(
    Table.from([
      ["key", "value"],
    ])
      .padding(1)
      .maxWidth(12)
      .flexGrow([0, 1])
      .toString(),
    `\
key value   `,
  );
});

test("should distribute available space proportionally by flexGrow weight", () => {
  assertEquals(
    Table.from([
      ["no", "ok"],
    ])
      .padding(1)
      .maxWidth(14)
      .flexGrow([1, 2])
      .toString(),
    `\
no    ok      `,
  );
});

test("should not expand columns when content already fills maxWidth", () => {
  assertEquals(
    Table.from([
      ["error", "fatal"],
    ])
      .padding(1)
      .maxWidth(11)
      .flexGrow(1)
      .toString(),
    "error fatal",
  );
});

test("should cap flexGrow at maxColWidth and redistribute surplus to other columns", () => {
  assertEquals(
    Table.from([
      ["#", "path"],
    ])
      .padding(1)
      .maxWidth(15)
      .maxColWidth([5, Infinity])
      .flexGrow([1, 1])
      .toString(),
    `\
#     path     `,
  );
});

test("should respect Column.flexGrow when set via Column API", () => {
  assertEquals(
    Table.from([
      ["host", "redis"],
    ])
      .padding(1)
      .maxWidth(18)
      .column(0, new Column().flexGrow(1))
      .toString(),
    "host         redis",
  );
});

test("should apply flexShrink and flexGrow cooperatively on different columns", () => {
  assertEquals(
    Table.from([
      ["JavaScript", "TypeScript", "Swift"],
    ])
      .padding(1)
      .maxWidth(16)
      .flexShrink([1, 1, 0])
      .flexGrow([0, 0, 1])
      .toString(),
    `\
Java Type Swift 
Scri Scri       
pt   pt         `,
  );
});

test("should apply flexShrink when minColWidth array is shorter than column count", () => {
  const out = Table.from([
    ["aaaaaaaa", "bbbbbbbb", "cccccccc"],
  ])
    .padding(1)
    .maxWidth(14)
    .minColWidth([1, 1])
    .flexShrink()
    .toString();
  assertEquals(out.split("\n").every((line) => line.length <= 14), true);
});

test("should not crash when a column shrinks to zero width", () => {
  Table.from([
    ["fixed", "(required)"],
  ])
    .padding(1)
    .maxWidth(8)
    .minColWidth([5, 0])
    .flexShrink([0, 1])
    .toString();
});
