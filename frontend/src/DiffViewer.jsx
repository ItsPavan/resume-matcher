import React, { useState, useEffect } from 'react';
import * as Diff from 'diff';
import './DiffViewer.css';

const DiffViewer = ({ original, customized, onComplete }) => {
    const [changes, setChanges] = useState([]);
    const [decisions, setDecisions] = useState({}); // { index: 'accept' | 'reject' }

    useEffect(() => {
        // Generate diff based on lines
        const diff = Diff.diffLines(original, customized);

        // Filter out parts that are common (no change) or structure specific changes
        // We want to present an array of "Conflicts" or "Unchanged" blocks

        // Simplification: We will capture indexes of ALL chunks, but only let users toggle "removed" vs "added" pairs
        // Actually, diffLines returns objects like { value: "...", added: true/undefined, removed: true/undefined }

        setChanges(diff);

        // Initialize common parts as auto-accepted (conceptually)
        // Real logic: We need to pair REMOVED and ADDED blocks that are adjacent to form a "change"
        // For this MVP, we will treat every Added/Removed block as an independent decision point.
        // If Removed: Rejecting means Keeping it. Accepting means Removing it.
        // If Added: Accepting means Keeping it. Rejecting means Removing it.
        // Wait, that's confusing.

        // Better Logic:
        // Render the FINAL stream.
        // - Common: Always render.
        // - Removed: Show as Red. Decision: Accept Deletion (Gone) vs Reject Deletion (Keep).
        // - Added: Show as Green. Decision: Accept Addition (Keep) vs Reject Addition (Gone).

    }, [original, customized]);

    const handleDecision = (index, type) => {
        setDecisions(prev => ({
            ...prev,
            [index]: type
        }));
    };

    const isComplete = () => {
        // Check if all needed decisions are made
        // We only need decisions for Added or Removed chunks
        return changes.every((part, index) => {
            if (!part.added && !part.removed) return true; // Common part
            return decisions[index] !== undefined;
        });
    };

    const handleFinalize = () => {
        // Construct final text
        let finalText = "";
        changes.forEach((part, index) => {
            if (!part.added && !part.removed) {
                finalText += part.value;
            } else if (part.added) {
                // It's a proposed addition
                if (decisions[index] === 'accept') {
                    finalText += part.value;
                }
                // If reject, we skip it
            } else if (part.removed) {
                // It's a proposed deletion
                if (decisions[index] === 'reject') {
                    // User rejected the deletion, so we KEEP the original text
                    finalText += part.value;
                }
                // If accept, we skip it (deletion confirmed)
            }
        });
        onComplete(finalText);
    };

    return (
        <div className="diff-viewer">
            <h3>Review Changes</h3>
            <div className="diff-container">
                {changes.map((part, index) => {
                    const isCommon = !part.added && !part.removed;
                    if (isCommon) return <span key={index}>{part.value}</span>;

                    const status = decisions[index]; // 'accept' or 'reject'

                    return (
                        <div key={index} className={`diff-chunk ${part.added ? 'added' : 'removed'} ${status || ''}`}>
                            <div className="diff-content">
                                <strong>{part.added ? "PROPOSED ADDITION" : "PROPOSED DELETION"}</strong>
                                <pre>{part.value}</pre>
                            </div>
                            <div className="diff-actions">
                                <button
                                    className={`btn-accept ${status === 'accept' ? 'active' : ''}`}
                                    onClick={() => handleDecision(index, 'accept')}
                                >
                                    {part.added ? "Accept (Add)" : "Accept (Delete)"}
                                </button>
                                <button
                                    className={`btn-reject ${status === 'reject' ? 'active' : ''}`}
                                    onClick={() => handleDecision(index, 'reject')}
                                >
                                    {part.added ? "Reject (Skip)" : "Reject (Keep)"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="diff-footer">
                <p>{isComplete() ? "All changes reviewed!" : "Please review all changes above."}</p>
                <button disabled={!isComplete()} onClick={handleFinalize} className="btn-finalize">
                    Generate Final PDF
                </button>
            </div>
        </div>
    );
};

export default DiffViewer;
