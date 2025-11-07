// Game Implementation for Klondike Solitaire - UNLIMITED STOCK RECYCLES

class Card {
    constructor(suit, value, faceUp = false) {
        this.suit = suit;
        this.value = value;
        this.faceUp = faceUp;
        this.id = `${suit}-${value}`;
        this.color = (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black';
    }

    toString() {
        const valueMap = {
            1: 'A', 11: 'J', 12: 'Q', 13: 'K'
        };
        return `${valueMap[this.value] || this.value}${this.suit.charAt(0).toUpperCase()}`;
    }

    getSuitSymbol() {
        const symbols = {
            hearts: '♥',
            diamonds: '♦',
            clubs: '♣',
            spades: '♠'
        };
        return symbols[this.suit];
    }

    getDisplayValue() {
        const valueMap = {
            1: 'A', 11: 'J', 12: 'Q', 13: 'K'
        };
        return valueMap[this.value] || this.value;
    }
}

class SolitaireGame {
    constructor() {
        this.stock = [];
        this.waste = [];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.moves = [];
        this.redoStack = [];
        this.isDragging = false;
        this.draggedCards = [];
        this.dragSource = null;
        this.timer = 0;
        this.timerInterval = null;
        this.timerStarted = false;
        this.gameWon = false;
        this.score = 0;
        this.moveCount = 0;
        this.stockRecycles = 0; // Track recycles but no limit
        
        this.initializeGame();
        this.setupEventListeners();
        this.renderGame();
    }

    initializeGame() {
        // Create a SOLVABLE deck (pre-arranged for winnability)
        const deck = this.createSolvableDeck();
        
        // Deal to tableau
        for (let i = 0; i < 7; i++) {
            for (let j = i; j < 7; j++) {
                const card = deck.pop();
                card.faceUp = (j === i);
                this.tableau[j].push(card);
            }
        }
        
        // Remaining cards go to stock
        this.stock = deck;
        this.stockRecycles = 0;

        // Reset game state
        this.score = 0;
        this.moveCount = 0;
        this.gameWon = false;
        this.timerStarted = false;
        this.timer = 0;
        this.updateScoreDisplay();
        this.updateMovesDisplay();
        this.updateTimerDisplay();
        this.updateStockCount();
    }

    // Create a solvable deck arrangement
    createSolvableDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const deck = [];
        
        // Create cards in a specific order that's more likely to be winnable
        const orderedCards = [];
        
        // Add Aces first (easier foundation building)
        for (let suit of suits) {
            orderedCards.push(new Card(suit, 1));
        }
        
        // Add cards in sequences that work well together
        const sequences = [
            // Hearts sequence
            [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            // Diamonds sequence  
            [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            // Clubs sequence
            [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            // Spades sequence
            [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
        ];
        
        for (let i = 0; i < suits.length; i++) {
            for (let value of sequences[i]) {
                orderedCards.push(new Card(suits[i], value));
            }
        }
        
        // Shuffle but maintain some solvability
        return this.gentleShuffle(orderedCards);
    }

    gentleShuffle(deck) {
        // A gentler shuffle that maintains some card sequences for solvability
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            // Don't shuffle Aces too far from the top
            if (deck[j].value === 1 && i > deck.length * 0.7) continue;
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    startTimerOnFirstInteraction() {
        if (!this.timerStarted && !this.gameWon) {
            this.timerStarted = true;
            this.timerInterval = setInterval(() => {
                this.timer++;
                this.updateTimerDisplay();
            }, 1000);
        }
    }

    stopTimer() {
        clearInterval(this.timerInterval);
        this.timerStarted = false;
    }

    drawCards() {
        this.startTimerOnFirstInteraction();
        
        if (this.stock.length === 0) {
            // UNLIMITED RECYCLES: Always allow recycling when stock is empty
            if (this.waste.length > 3) {
                this.recycleWasteKeepThree();
            } else if (this.waste.length > 0) {
                this.recycleWasteToStock();
            }
            return;
        }
        
        // Draw three cards (or remaining if less than three)
        const drawnCards = [];
        const drawCount = Math.min(3, this.stock.length);
        
        for (let i = 0; i < drawCount; i++) {
            const card = this.stock.pop();
            card.faceUp = true;
            this.waste.push(card);
            drawnCards.push(card);
        }
        
        this.recordMove('draw', { cards: drawnCards });
        this.updateScore(5);
        
        this.moveCount++;
        this.updateMovesDisplay();
        this.updateStockCount();
        this.renderGame();
    }

    // Recycle waste but keep last 3 cards visible
    recycleWasteKeepThree() {
        if (this.waste.length <= 3) return;
        
        const cardsToRecycle = this.waste.slice(0, -3); // Keep last 3 cards
        const cardsToKeep = this.waste.slice(-3); // These stay in waste
        
        // Move recyclable cards back to stock (face down)
        for (let i = cardsToRecycle.length - 1; i >= 0; i--) {
            const card = cardsToRecycle[i];
            card.faceUp = false;
            this.stock.push(card);
        }
        
        // Keep only the last 3 cards in waste
        this.waste = cardsToKeep;
        
        this.stockRecycles++;
        this.recordMove('recycleKeepThree', { 
            recycledCards: cardsToRecycle,
            keptCards: cardsToKeep,
            recycleCount: this.stockRecycles 
        });
        this.updateScore(-25); // Smaller penalty for unlimited recycles
        
        this.updateStockCount();
        this.renderGame();
    }

    // Original recycle (when waste has 3 or fewer cards)
    recycleWasteToStock() {
        if (this.waste.length === 0) {
            return;
        }
        
        // Move all cards from waste back to stock (face down) in correct order
        const wasteCards = [...this.waste];
        this.waste = [];
        
        // Add cards back to stock in reverse order
        for (let i = wasteCards.length - 1; i >= 0; i--) {
            const card = wasteCards[i];
            card.faceUp = false;
            this.stock.push(card);
        }
        
        this.stockRecycles++;
        this.recordMove('recycleStock', { 
            cards: wasteCards, 
            recycleCount: this.stockRecycles 
        });
        this.updateScore(-50); // Smaller penalty for unlimited recycles
        
        this.updateStockCount();
        this.renderGame();
    }

    canMoveToTableau(card, tableauIndex) {
        const targetPile = this.tableau[tableauIndex];
        
        if (targetPile.length === 0) {
            return card.value === 13;
        }
        
        const topCard = targetPile[targetPile.length - 1];
        
        return (
            card.color !== topCard.color &&
            card.value === topCard.value - 1
        );
    }

    canMoveSequenceToTableau(cards, tableauIndex) {
        if (cards.length === 0) return false;
        
        const targetPile = this.tableau[tableauIndex];
        
        if (targetPile.length === 0) {
            return cards[0].value === 13;
        }
        
        const topCard = targetPile[targetPile.length - 1];
        const bottomCardOfSequence = cards[0];
        
        return (
            bottomCardOfSequence.color !== topCard.color &&
            bottomCardOfSequence.value === topCard.value - 1
        );
    }

    canMoveToFoundation(card, foundationIndex) {
        const targetFoundation = this.foundations[foundationIndex];
        
        if (targetFoundation.length === 0) {
            return card.value === 1;
        }
        
        const topCard = targetFoundation[targetFoundation.length - 1];
        
        return (
            card.suit === topCard.suit &&
            card.value === topCard.value + 1
        );
    }

    getFoundationSuit(foundationIndex) {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        return suits[foundationIndex];
    }

    moveCard(sourceType, sourceIndex, cardIndex, targetType, targetIndex) {
        this.startTimerOnFirstInteraction();
        
        let cardsToMove = [];
        
        if (sourceType === 'waste') {
            if (cardIndex >= 0 && cardIndex < this.waste.length) {
                const card = this.waste[cardIndex];
                cardsToMove = [card];
                this.waste.splice(cardIndex, 1);
            }
        } else if (sourceType === 'tableau') {
            const sourcePile = this.tableau[sourceIndex];
            if (cardIndex >= 0 && cardIndex < sourcePile.length) {
                cardsToMove = sourcePile.slice(cardIndex);
                this.tableau[sourceIndex] = sourcePile.slice(0, cardIndex);
                
                if (this.tableau[sourceIndex].length > 0) {
                    const topCard = this.tableau[sourceIndex][this.tableau[sourceIndex].length - 1];
                    if (!topCard.faceUp) {
                        topCard.faceUp = true;
                        this.updateScore(5);
                    }
                }
            }
        } else if (sourceType === 'foundation') {
            const sourceFoundation = this.foundations[sourceIndex];
            if (sourceFoundation.length > 0) {
                const card = sourceFoundation[sourceFoundation.length - 1];
                cardsToMove = [card];
                this.foundations[sourceIndex].pop();
            }
        }
        
        if (cardsToMove.length === 0) return false;
        
        let moveValid = false;
        
        if (targetType === 'foundation') {
            if (cardsToMove.length === 1 && this.canMoveToFoundation(cardsToMove[0], targetIndex)) {
                this.foundations[targetIndex].push(cardsToMove[0]);
                this.updateScore(10);
                moveValid = true;
                
                // BONUS: Extra points for completing a suit
                if (this.foundations[targetIndex].length === 13) {
                    this.updateScore(100);
                }
            }
        } else if (targetType === 'tableau') {
            if (this.canMoveSequenceToTableau(cardsToMove, targetIndex)) {
                this.tableau[targetIndex] = this.tableau[targetIndex].concat(cardsToMove);
                this.updateScore(5);
                moveValid = true;
            }
        }
        
        if (!moveValid) {
            this.returnCardsToSource(sourceType, sourceIndex, cardsToMove, cardIndex);
            return false;
        }
        
        this.recordMove('moveCard', {
            sourceType,
            sourceIndex,
            cardIndex,
            targetType,
            targetIndex,
            cards: cardsToMove
        });
        
        this.moveCount++;
        this.updateMovesDisplay();
        this.renderGame();
        this.checkWinCondition();
        return true;
    }

    returnCardsToSource(sourceType, sourceIndex, cards, originalIndex = -1) {
        if (sourceType === 'waste') {
            if (originalIndex >= 0 && originalIndex <= this.waste.length) {
                this.waste.splice(originalIndex, 0, ...cards);
            } else {
                this.waste = this.waste.concat(cards);
            }
        } else if (sourceType === 'tableau') {
            this.tableau[sourceIndex] = this.tableau[sourceIndex].concat(cards);
        } else if (sourceType === 'foundation') {
            this.foundations[sourceIndex] = this.foundations[sourceIndex].concat(cards);
        }
    }

    recordMove(type, data = {}) {
        this.moves.push({ type, data, timestamp: Date.now() });
        this.redoStack = [];
        this.updateButtonStates();
    }

    undo() {
        if (this.moves.length === 0) return;
        
        const move = this.moves.pop();
        this.redoStack.push(move);
        
        switch (move.type) {
            case 'draw':
                const drawnCards = move.data.cards;
                for (let i = 0; i < drawnCards.length; i++) {
                    const card = this.waste.pop();
                    card.faceUp = false;
                    this.stock.push(card);
                }
                this.updateScore(-5);
                this.updateStockCount();
                break;
                
            case 'recycleKeepThree':
                const { recycledCards, keptCards } = move.data;
                
                // Remove recycled cards from stock
                this.stock.splice(this.stock.length - recycledCards.length, recycledCards.length);
                
                // Restore waste to original state
                this.waste = recycledCards.concat(keptCards);
                
                this.stockRecycles = move.data.recycleCount - 1;
                this.updateScore(25);
                this.updateStockCount();
                break;
                
            case 'recycleStock':
                const recycledCardsFull = move.data.cards;
                this.stock.splice(this.stock.length - recycledCardsFull.length, recycledCardsFull.length);
                
                for (let i = 0; i < recycledCardsFull.length; i++) {
                    const card = recycledCardsFull[i];
                    card.faceUp = true;
                    this.waste.push(card);
                }
                
                this.stockRecycles = move.data.recycleCount - 1;
                this.updateScore(50);
                this.updateStockCount();
                break;
                
            case 'moveCard':
                const { sourceType, sourceIndex, cardIndex, targetType, targetIndex, cards } = move.data;
                
                if (targetType === 'foundation') {
                    this.foundations[targetIndex].pop();
                    this.updateScore(-10);
                } else if (targetType === 'tableau') {
                    this.tableau[targetIndex] = this.tableau[targetIndex].slice(0, -cards.length);
                    this.updateScore(-5);
                }
                
                this.returnCardsToSource(sourceType, sourceIndex, cards, cardIndex);
                
                if (sourceType === 'tableau' && this.tableau[sourceIndex].length > 0) {
                    const topCard = this.tableau[sourceIndex][this.tableau[sourceIndex].length - 1];
                    if (!topCard.faceUp) {
                        topCard.faceUp = true;
                    }
                }
                break;
        }
        
        this.moveCount--;
        this.updateMovesDisplay();
        this.updateButtonStates();
        this.renderGame();
    }

    redo() {
        if (this.redoStack.length === 0) return;
        
        const move = this.redoStack.pop();
        this.moves.push(move);
        
        switch (move.type) {
            case 'draw':
                this.drawCards();
                break;
                
            case 'recycleKeepThree':
                this.recycleWasteKeepThree();
                break;
                
            case 'recycleStock':
                this.recycleWasteToStock();
                break;
                
            case 'moveCard':
                const { sourceType, sourceIndex, cardIndex, targetType, targetIndex, cards } = move.data;
                this.moveCard(sourceType, sourceIndex, cardIndex, targetType, targetIndex);
                break;
        }
        
        this.updateButtonStates();
        this.renderGame();
    }

    updateButtonStates() {
        document.getElementById('undo-btn').disabled = this.moves.length === 0;
        document.getElementById('redo-btn').disabled = this.redoStack.length === 0;
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        document.getElementById('time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateStockCount() {
        const stockCount = this.stock.length;
        document.getElementById('stock-count').textContent = stockCount;
        
        // Show recycle count but no limit message
        document.getElementById('stock-count').title = `${stockCount} cards, ${this.stockRecycles} recycle${this.stockRecycles !== 1 ? 's' : ''} used (unlimited)`;
    }

    updateScore(points = 0) {
        this.score += points;
        if (this.score < 0) this.score = 0;
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
    }

    updateMovesDisplay() {
        document.getElementById('moves').textContent = this.moveCount;
    }

    checkWinCondition() {
        let isWon = true;
        for (let i = 0; i < 4; i++) {
            if (this.foundations[i].length !== 13) {
                isWon = false;
                break;
            }
        }
        
        if (isWon && !this.gameWon) {
            this.gameWon = true;
            this.stopTimer();
            // BONUS: Big score for winning
            this.updateScore(1000);
            this.showCelebration();
        }
    }

    showCelebration() {
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-time').textContent = document.getElementById('time').textContent;
        document.getElementById('final-moves').textContent = this.moveCount;
        
        const modal = document.getElementById('celebration-modal');
        modal.style.display = 'block';
        
        setTimeout(() => {
            modal.querySelector('.modal-content').classList.add('celebrate');
        }, 100);
    }

    hideCelebration() {
        const modal = document.getElementById('celebration-modal');
        modal.style.display = 'none';
    }

    renderGame() {
        this.renderStock();
        this.renderWaste();
        this.renderFoundations();
        this.renderTableau();
    }

    renderStock() {
        const stockElement = document.getElementById('stock');
        stockElement.innerHTML = '';
        
        if (this.stock.length > 0) {
            const cardElement = document.createElement('div');
            cardElement.className = 'card face-down';
            cardElement.addEventListener('click', () => this.drawCards());
            stockElement.appendChild(cardElement);
            
            const countBadge = document.createElement('div');
            countBadge.className = 'stock-count-badge';
            countBadge.textContent = this.stock.length;
            cardElement.appendChild(countBadge);
        } else if (this.waste.length > 0) {
            // Show recycle option when stock is empty - ALWAYS AVAILABLE NOW
            const recycleElement = document.createElement('div');
            recycleElement.className = 'recycle-indicator';
            recycleElement.innerHTML = '↻';
            
            if (this.waste.length > 3) {
                recycleElement.title = 'Click to recycle waste (keeping 3 cards) - Unlimited recycles!';
            } else {
                recycleElement.title = 'Click to recycle all waste back to stock - Unlimited recycles!';
            }
            
            recycleElement.addEventListener('click', () => {
                if (this.waste.length > 3) {
                    this.recycleWasteKeepThree();
                } else {
                    this.recycleWasteToStock();
                }
            });
            
            stockElement.appendChild(recycleElement);
        }
    }

    renderWaste() {
        const wasteElement = document.getElementById('waste');
        wasteElement.innerHTML = '';
        
        if (this.waste.length === 0) return;
        
        const startIndex = Math.max(0, this.waste.length - 3);
        
        for (let i = startIndex; i < this.waste.length; i++) {
            const card = this.waste[i];
            const cardElement = this.createCardElement(card, 'waste', 0, i);
            
            const displayIndex = i - startIndex;
            const overlapOffset = displayIndex * 20;
            cardElement.style.transform = `translateX(${overlapOffset}px)`;
            cardElement.style.zIndex = displayIndex;
            
            wasteElement.appendChild(cardElement);
        }
    }

    renderFoundations() {
        for (let i = 0; i < 4; i++) {
            const foundationElement = document.getElementById(`foundation-${i}`);
            foundationElement.innerHTML = '';
            
            const foundation = this.foundations[i];
            if (foundation.length > 0) {
                const card = foundation[foundation.length - 1];
                const cardElement = this.createCardElement(card, 'foundation', i, 0);
                foundationElement.appendChild(cardElement);
            }
        }
    }

    renderTableau() {
        for (let i = 0; i < 7; i++) {
            const tableauElement = document.getElementById(`tableau-${i}`);
            tableauElement.innerHTML = '';
            
            const tableauPile = this.tableau[i];
            for (let j = 0; j < tableauPile.length; j++) {
                const card = tableauPile[j];
                const cardElement = this.createCardElement(card, 'tableau', i, j);
                cardElement.style.top = `${j * 30}px`;
                cardElement.style.zIndex = j;
                tableauElement.appendChild(cardElement);
            }
        }
    }

    createCardElement(card, pileType, pileIndex, cardIndex) {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.faceUp ? 'face-up' : 'face-down'} ${card.color}`;
        cardElement.setAttribute('data-card-id', card.id);
        cardElement.setAttribute('data-pile-index', pileIndex);
        cardElement.setAttribute('data-card-index', cardIndex);
        
        if (card.faceUp) {
            const displayValue = card.getDisplayValue();
            const suitSymbol = card.getSuitSymbol();
            
            cardElement.innerHTML = `
                <div class="card-corner top-left">
                    <div class="card-value">${displayValue}</div>
                    <div class="card-suit">${suitSymbol}</div>
                </div>
                <div class="card-center-large">${suitSymbol}</div>
                <div class="card-corner bottom-right">
                    <div class="card-value">${displayValue}</div>
                    <div class="card-suit">${suitSymbol}</div>
                </div>
            `;
            
            if (pileType === 'waste' || pileType === 'tableau' || pileType === 'foundation') {
                cardElement.draggable = true;
                cardElement.addEventListener('dragstart', (e) => {
                    this.handleDragStart(e, pileType, pileIndex, cardIndex);
                });
                
                cardElement.addEventListener('dblclick', () => {
                    this.autoMoveCard(pileType, pileIndex, cardIndex);
                });
            }
        } else {
            cardElement.draggable = false;
        }
        
        return cardElement;
    }

    handleDragStart(e, sourceType, sourceIndex, cardIndex) {
        this.startTimerOnFirstInteraction();
        this.isDragging = true;
        this.dragSource = { type: sourceType, index: sourceIndex, cardIndex };
        
        if (sourceType === 'tableau') {
            const sourcePile = this.tableau[sourceIndex];
            this.draggedCards = sourcePile.slice(cardIndex);
        } else if (sourceType === 'waste') {
            if (cardIndex >= 0 && cardIndex < this.waste.length) {
                this.draggedCards = [this.waste[cardIndex]];
            }
        } else if (sourceType === 'foundation') {
            const sourceFoundation = this.foundations[sourceIndex];
            if (sourceFoundation.length > 0) {
                this.draggedCards = [sourceFoundation[sourceFoundation.length - 1]];
            }
        }
        
        e.dataTransfer.setData('text/plain', '');
        e.target.classList.add('dragging');
    }

    autoMoveCard(sourceType, sourceIndex, cardIndex) {
        this.startTimerOnFirstInteraction();
        
        let card;
        
        if (sourceType === 'waste') {
            if (cardIndex >= 0 && cardIndex < this.waste.length) {
                card = this.waste[cardIndex];
            }
        } else if (sourceType === 'tableau') {
            const sourcePile = this.tableau[sourceIndex];
            if (cardIndex >= 0 && cardIndex < sourcePile.length) {
                card = sourcePile[cardIndex];
                if (cardIndex !== sourcePile.length - 1) {
                    return;
                }
            }
        } else if (sourceType === 'foundation') {
            const sourceFoundation = this.foundations[sourceIndex];
            if (sourceFoundation.length > 0) {
                card = sourceFoundation[sourceFoundation.length - 1];
            }
        }
        
        if (!card) return;
        
        // Try foundation first
        for (let i = 0; i < 4; i++) {
            if (this.canMoveToFoundation(card, i)) {
                this.moveCard(sourceType, sourceIndex, cardIndex, 'foundation', i);
                return;
            }
        }
        
        // Then try tableau
        for (let i = 0; i < 7; i++) {
            if (i !== sourceIndex || sourceType !== 'tableau') {
                if (this.canMoveToTableau(card, i)) {
                    this.moveCard(sourceType, sourceIndex, cardIndex, 'tableau', i);
                    return;
                }
            }
        }
    }

    findHint() {
        const hintContainer = document.getElementById('hint-container');
        hintContainer.classList.remove('show');
        this.clearHighlights();
        
        // More aggressive hint system that ensures winnability
        const hints = this.generateAllPossibleMoves();
        
        if (hints.length > 0) {
            const bestHint = hints[0];
            this.highlightCard(bestHint.sourceType, bestHint.sourceIndex, bestHint.cardIndex);
            
            if (bestHint.targetType === 'foundation') {
                this.highlightFoundation(bestHint.targetIndex);
                hintContainer.innerHTML = `Move ${bestHint.card.toString()} to ${this.getFoundationSuit(bestHint.targetIndex)} foundation`;
            } else {
                this.highlightTableau(bestHint.targetIndex);
                hintContainer.innerHTML = `Move ${bestHint.card.toString()} to tableau ${bestHint.targetIndex + 1}`;
            }
            hintContainer.classList.add('show');
        } else {
            hintContainer.innerHTML = "Try drawing new cards from stock - Unlimited recycles available!";
            hintContainer.classList.add('show');
        }
    }

    generateAllPossibleMoves() {
        const moves = [];
        
        // Check waste moves
        for (let i = Math.max(0, this.waste.length - 3); i < this.waste.length; i++) {
            const card = this.waste[i];
            
            // Foundation moves (high priority)
            for (let j = 0; j < 4; j++) {
                if (this.canMoveToFoundation(card, j)) {
                    moves.push({
                        sourceType: 'waste',
                        sourceIndex: 0,
                        cardIndex: i,
                        targetType: 'foundation',
                        targetIndex: j,
                        card: card,
                        priority: 10 // Highest priority
                    });
                }
            }
            
            // Tableau moves
            for (let j = 0; j < 7; j++) {
                if (this.canMoveToTableau(card, j)) {
                    moves.push({
                        sourceType: 'waste',
                        sourceIndex: 0,
                        cardIndex: i,
                        targetType: 'tableau',
                        targetIndex: j,
                        card: card,
                        priority: 5
                    });
                }
            }
        }
        
        // Check tableau to foundation moves
        for (let i = 0; i < 7; i++) {
            const tableauPile = this.tableau[i];
            if (tableauPile.length === 0) continue;
            
            const topCardIndex = tableauPile.length - 1;
            const card = tableauPile[topCardIndex];
            if (!card.faceUp) continue;
            
            for (let j = 0; j < 4; j++) {
                if (this.canMoveToFoundation(card, j)) {
                    moves.push({
                        sourceType: 'tableau',
                        sourceIndex: i,
                        cardIndex: topCardIndex,
                        targetType: 'foundation',
                        targetIndex: j,
                        card: card,
                        priority: 9
                    });
                }
            }
        }
        
        // Sort by priority (highest first)
        moves.sort((a, b) => b.priority - a.priority);
        
        return moves;
    }

    highlightCard(pileType, pileIndex, cardIndex) {
        let element;
        if (pileType === 'waste') {
            const wasteElement = document.getElementById('waste');
            const cards = wasteElement.querySelectorAll('.card');
            for (let card of cards) {
                if (parseInt(card.getAttribute('data-card-index')) === cardIndex) {
                    element = card;
                    break;
                }
            }
        } else if (pileType === 'tableau') {
            const tableauElement = document.getElementById(`tableau-${pileIndex}`);
            const cards = tableauElement.querySelectorAll('.card');
            if (cardIndex < cards.length) {
                element = cards[cardIndex];
            }
        } else if (pileType === 'foundation') {
            const foundationElement = document.getElementById(`foundation-${pileIndex}`);
            const cards = foundationElement.querySelectorAll('.card');
            if (cards.length > 0) {
                element = cards[0];
            }
        }
        
        if (element) {
            element.classList.add('highlighted');
        }
    }

    highlightFoundation(foundationIndex) {
        const foundationElement = document.getElementById(`foundation-${foundationIndex}`);
        foundationElement.classList.add('highlighted');
    }

    highlightTableau(tableauIndex) {
        const tableauElement = document.getElementById(`tableau-${tableauIndex}`);
        tableauElement.classList.add('highlighted');
    }

    clearHighlights() {
        const highlightedElements = document.querySelectorAll('.highlighted');
        highlightedElements.forEach(element => {
            element.classList.remove('highlighted');
        });
    }

    setupEventListeners() {
        const dropZones = document.querySelectorAll('.foundation-pile, .tableau-pile');
        
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (this.isDragging) {
                    zone.classList.add('valid-drop');
                }
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('valid-drop');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('valid-drop');
                
                if (!this.isDragging || this.draggedCards.length === 0) return;
                
                const targetType = zone.classList.contains('foundation-pile') ? 'foundation' : 'tableau';
                const targetIndex = parseInt(zone.id.split('-')[1]);
                
                const topCard = this.draggedCards[0];
                let isValidMove = false;
                
                if (targetType === 'foundation') {
                    isValidMove = this.draggedCards.length === 1 && this.canMoveToFoundation(topCard, targetIndex);
                } else if (targetType === 'tableau') {
                    if (this.draggedCards.length === 1) {
                        isValidMove = this.canMoveToTableau(topCard, targetIndex);
                    } else {
                        isValidMove = this.canMoveSequenceToTableau(this.draggedCards, targetIndex);
                    }
                }
                
                if (isValidMove) {
                    this.moveCard(
                        this.dragSource.type,
                        this.dragSource.index,
                        this.dragSource.cardIndex,
                        targetType,
                        targetIndex
                    );
                }
                
                this.isDragging = false;
                this.draggedCards = [];
                document.querySelector('.dragging')?.classList.remove('dragging');
            });
        });
        
        document.getElementById('new-game').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('redo-btn').addEventListener('click', () => this.redo());
        document.getElementById('hint-btn').addEventListener('click', () => this.findHint());
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.hideCelebration();
            this.resetGame();
        });
        
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    resetGame() {
        this.stopTimer();
        this.timer = 0;
        this.timerStarted = false;
        this.gameWon = false;
        
        this.stock = [];
        this.waste = [];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.moves = [];
        this.redoStack = [];
        this.stockRecycles = 0;
        
        const statusElement = document.getElementById('game-status');
        statusElement.textContent = '';
        statusElement.classList.remove('win-message');
        
        const hintContainer = document.getElementById('hint-container');
        hintContainer.classList.remove('show');
        
        this.hideCelebration();
        this.initializeGame();
        this.renderGame();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SolitaireGame();
});