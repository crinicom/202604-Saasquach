'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Outfit, sans-serif',
  themeVariables: {
    primaryColor: '#059669',
    primaryTextColor: '#fff',
    primaryBorderColor: '#059669',
    lineColor: '#c3a343',
    secondaryColor: '#c3a343',
    tertiaryColor: '#2d2d2d'
  }
});

interface MermaidDiagramProps {
  code: string;
  onNodeClick?: (nodeId: string) => void;
  className?: string;
  frictionMap?: { nodeId: string; type: 'friction' | 'approval'; count: number }[];
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code, onNodeClick, className, frictionMap = [] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    const renderDiagram = async () => {
      if (!code || !containerRef.current) return;
      
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        setSvg(svg);
      } catch (error) {
        console.error('[MERMAID] Render Error:', error);
      }
    };

    renderDiagram();
  }, [code]);

  useEffect(() => {
    if (!svg || !containerRef.current) return;

    // Heatmap application
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    frictionMap.forEach(point => {
      const nodeElements = svgElement.querySelectorAll(`[id^="flowchart-${point.nodeId}-"]`);
      nodeElements.forEach(el => {
        const rect = el.querySelector('rect, polygon, circle, ellipse, path');
        if (rect) {
          const color = point.type === 'friction' ? 'rgba(220, 38, 38, 0.6)' : 'rgba(16, 185, 129, 0.6)';
          const glow = point.type === 'friction' ? 'rgba(220, 38, 38, 0.4)' : 'rgba(16, 185, 129, 0.4)';
          
          rect.setAttribute('style', `fill: ${color} !important; stroke: ${color} !important; filter: drop-shadow(0 0 8px ${glow}); transition: all 0.5s ease;`);
          
          if (point.count > 1) {
             // Add pulse animation for high friction
             rect.classList.add('animate-pulse');
          }
        }
      });
    });

    // Node click handlers
    const nodes = svgElement.querySelectorAll('.node');
    nodes.forEach(node => {
      node.addEventListener('click', (e) => {
        const nodeId = node.id.split('-')[1];
        if (onNodeClick) onNodeClick(nodeId);
      });
      (node as HTMLElement).style.cursor = 'pointer';
    });
  }, [svg, frictionMap, onNodeClick]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full flex items-center justify-center ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
