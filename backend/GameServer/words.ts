export const WORD_CATEGORIES: Record<string, string[]> = {
  Animals: [
    "Cat", "Dog", "Elephant", "Giraffe", "Penguin", "Dolphin", "Tiger",
    "Kangaroo", "Panda", "Crocodile", "Parrot", "Jellyfish", "Hamster",
    "Flamingo", "Octopus", "Shark", "Gorilla", "Chameleon", "Hedgehog", "Sloth"
  ],
  Food: [
    "Pizza", "Sushi", "Burger", "Tacos", "Pasta", "Pancakes", "Spaghetti",
    "Waffle", "Donut", "Sandwich", "Ramen", "Burrito", "Croissant",
    "Lasagna", "Popcorn", "Pretzel", "Cheesecake", "Hotdog", "Nachos", "Dumplings"
  ],
  Sports: [
    "Soccer", "Basketball", "Tennis", "Swimming", "Boxing", "Skateboard",
    "Baseball", "Volleyball", "Archery", "Cycling", "Gymnastics", "Surfing",
    "Skiing", "Wrestling", "Bowling", "Badminton", "Fencing", "Rowing", "Diving", "Polo"
  ],
  Movies: [
    "Titanic", "Inception", "Avatar", "Jaws", "Ghostbusters", "Alien",
    "Matrix", "Shrek", "Grease", "Gladiator", "Interstellar", "Jumanji",
    "Frozen", "Coco", "Up", "Moana", "Beetlejuice", "Psycho", "Mulan", "Tenet"
  ],
  Nature: [
    "Volcano", "Waterfall", "Tornado", "Rainbow", "Glacier", "Desert",
    "Forest", "Island", "Coral", "Tsunami", "Canyon", "Swamp",
    "Tundra", "Geyser", "Lagoon", "Cliff", "Dune", "Fjord", "Avalanche", "Blizzard"
  ],
  Technology: [
    "Robot", "Drone", "Rocket", "Satellite", "Keyboard", "Laptop",
    "Microscope", "Telescope", "Submarine", "Helicopter", "Antenna",
    "Hologram", "Circuit", "Battery", "Radar", "Joystick", "Scanner", "Printer", "Charger", "Server"
  ],
  Random: []
};

// Fill "Random" 
WORD_CATEGORIES.Random = Object.entries(WORD_CATEGORIES)
  .filter(([key]) => key !== "Random")
  .flatMap(([, words]) => words);

export const CATEGORY_NAMES = Object.keys(WORD_CATEGORIES);

export function getWordsForCategory(category: string): string[] {
  return WORD_CATEGORIES[category] ?? WORD_CATEGORIES["Random"];
}

export function pickRandomWords(category: string, count: number): string[] {
  const pool = [...getWordsForCategory(category)];
  const picked: string[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}
