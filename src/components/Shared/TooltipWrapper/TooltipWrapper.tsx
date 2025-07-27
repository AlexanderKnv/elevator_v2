import React, { useState, useCallback } from 'react';
import './TooltipWrapper.css';

interface TooltipWrapperProps {
    children: React.ReactNode;
    tooltipContent: React.ReactNode;
    isDragging?: boolean;
    dragRef?: (node: HTMLDivElement | null) => void;
}

const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
    children,
    tooltipContent,
    isDragging = false,
    dragRef,
}) => {
    const [show, setShow] = useState(false);

    const handleMouseEnter = () => setShow(true);
    const handleMouseLeave = () => setShow(false);
    const handleDragStart = () => setShow(false);

    const setRefs = useCallback(
        (node: HTMLDivElement | null) => {
            if (dragRef) dragRef(node);
        },
        [dragRef]
    );

    return (
        <div
            className="tooltip-wrapper"
            ref={setRefs}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onDragStart={handleDragStart}
        >
            {children}
            {show && !isDragging && (
                <div className="tooltip-content">
                    {tooltipContent}
                </div>
            )}
        </div>
    );
};

export default TooltipWrapper;

