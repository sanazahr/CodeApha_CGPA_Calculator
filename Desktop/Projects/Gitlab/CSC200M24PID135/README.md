# Klondike Solitaire - CSC200M24PID135

This is a **JavaScript + HTML + CSS** implementation of the classic **Klondike Solitaire** game, developed according to the project requirements.

##  Features
- Full Solitaire gameplay logic
- Drag-and-drop card interactions
- Valid move checking rules
- Stock, Waste, Foundation, and Tableau piles implemented
- Move counter and timer (to be added if required)
- Clean UI layout using CSS

## Data Structures Used
| Data Structure | Where Used | Description |
|---------------|------------|-------------|
| **Array**     | Deck storage, tableau piles | Stores and shuffles cards |
| **Stack (LIFO)** | Foundation piles | Cards are added in increasing order |
| **Queue (FIFO)** | Stock → Waste card drawing logic | Cards move in fixed order |
| **Linked List** | Tableau movement chains | Moves groups of cards efficiently |
| **Dictionary/Object** | Card lookup and state tracking | Fast access to card properties |

## How to Run
1. Open the project folder
2. Open **index.html** in your browser
3. Play the game! 

No installation is required.

---

##  File Structure
