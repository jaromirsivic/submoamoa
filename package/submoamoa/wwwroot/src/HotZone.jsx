import React from 'react';

const HotZone = () => {
    return (
        <div className="page-container">
            <div className="content-card glass" style={{ padding: '2rem', borderRadius: '1rem', borderLeft: '4px solid var(--color-accent)' }}>
                <p>
                    Welcome to the Hot Zone. This area is restricted or special.
                </p>
                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem' }}>
                            <h3>Item {i}</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>Description for item {i}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HotZone;
