
# Main Extraction Algorithm

### Pre-Processing

Before any file is parsed, it is first pre-processed by splitRead (in utils.ts). The purpose of splitRead is to take a file path, read the file inside and convert it into an array of strings, where each string is a line in the file. More importantly, it creates two copies of this array, one where Polished mode is activated, and one where Faithful mode is activated. It ignores any special palette choices, like HGSS/Monochrome/Noir/NoRTC. It also removes macro definitions, comments and empty lines. Finally, it performs some string replacements for convenience (e.g. PSYCHIC_M -> PSYCHIC, # -> Poké, etc.)

### Data Processing

The first step of each extraction algorithm is a file within the constants folder. Each file in the constants folder assigns a unique index to each ID. The index is always a number. The ID is a string, if assigned one. Some indexes do not have IDs.

We use extractConsts from the common.ts file to create an array of { index, id } objects. We then use other extractors to create more arrays of { index, property } objects. For example, extractNames would access data/[category]/names.asm, and produce arrays of { index, name } objects. Note that all extractors must be **index-based**. This means that some extractors will access multiple files. For example, extractEggMoves would first access data/pokemon/egg_move_pointers.asm, and then retrieve the index-based pointers from there to retrieve the relevant egg moves from data/pokemon/egg_moves.asm.

Finally, after every extractor is written, consolidate() accepts all the data arrays as input, and returns a consolidated array that combines all objects by index. Note that some files **may not** contain every index. For example, the constant file may define an entry, but a relevant data file may not define anything for that index. In such cases, the consolidate function will not throw an error - it will just produce a consolidated object without the undefined property.

### Data Writing

Outputs of consolidate() can be written to the data folder in two main ways. For smaller arrays, writeJSON can be used to quickly write the entire array into a JSON file. For bigger arrays, we can choose to instead use writeSplitJSON, which will split the array, writing a JSON file for each entry. It also writes both polished/faithful data to each individual file. This enforces consistency - no matter which method you use, when you retrieve the JSON output, you must first access either the Polished or the Faithful data. Note that individual files are named by index. This is because that is the only guaranteed unique property of every object in the array.

### Graphics Processing

Graphics processing is run separately from the main Data processing, as it is considerably more time-intensive. Note that between the Polished and Faithful versions of the game, the only current discrepancy in graphics is in the GBC Sounds Key Item, which is of a different colour between the Polished and Faithful versions. For that reason, to save time, we only generate graphics for the Polished version of the game. To do this, after using splitRead to read a file, we discard the faithful output.

All sprites, palettes and animation code file paths are accessible once again from the relevant constant file. For example, constants/item_constants -> data/items/icon_pointers -> gfx/items.asm -> gfx/items/great_ball.png is the path required to find the sprite for a Great Ball.

There are two main data types: SpriteData and GIFData. SpriteData is just an object with { index, id, spritePath, palette }. GIFData adds an anim property. For example, items_gfx generates an array of SpriteData.

Once the sprite, palette and/or animation file path is retrieved, the functions generateSprites and generateGIFs (in utils.ts) can be used to generate the relevant graphics in the gfx folder. Once again, all graphics files should be named after the index. This makes it easy to find said graphics on the client-side. For one-off graphics, one can directly use applyPalette and createGIF.
