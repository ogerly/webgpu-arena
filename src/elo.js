// elo.js
// Logik für das Bewertungssystem der OS-Arena

export const ELO_START = 1200;
export const ELO_K     = 32;

/**
 * Berechnet die neuen Scores nach einem Sieg
 * @param {number} winnerScore 
 * @param {number} loserScore 
 * @returns {object} { winner, loser }
 */
export function calcEloWin(winnerScore, loserScore) {
  const expected = 1 / (1 + Math.pow(10, (loserScore - winnerScore) / 400));
  const change = Math.round(ELO_K * (1 - expected));
  return {
    winner: winnerScore + change,
    loser:  loserScore - change,
    change: change
  };
}

/**
 * Berechnet die neuen Scores nach einem Unentschieden
 * @param {number} scoreA 
 * @param {number} scoreB 
 * @returns {object} { a, b }
 */
export function calcEloDraw(scoreA, scoreB) {
  const expectedA = 1 / (1 + Math.pow(10, (scoreB - scoreA) / 400));
  const changeA = Math.round(ELO_K * (0.5 - expectedA));
  
  return {
    a: scoreA + changeA,
    b: scoreB - changeA, // Spiegelbildlich für die Summenkonstanz
    change: Math.abs(changeA)
  };
}
