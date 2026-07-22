import React from 'react';

const CyberCard = ({ title, icon: Icon, children, className = '', headerAction, glow = false, glowColor = 'accent' }) => {
  const glowClasses = {
    accent: 'shadow-cyber',
    red: 'shadow-cyber-red',
    green: 'shadow-cyber-green'
  };

  return (
    <div className={`bg-cyber-cards/75 backdrop-blur-md border border-white/5 rounded-sm p-4 glow-border transition-all duration-300 ${glow ? glowClasses[glowColor] : ''} ${className}`}>
      {(title || Icon) && (
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-cyber-accent" />}
            {title && <h3 className="font-mono text-xs font-bold tracking-wider text-slate-400 uppercase">{title}</h3>}
          </div>
          {headerAction && <div className="text-xs">{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default CyberCard;
