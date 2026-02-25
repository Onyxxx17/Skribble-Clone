import { Stage, Layer, Line, Text } from "react-konva";
import { useState, useRef, useEffect } from "react";
import socket from "../socket";
import {
  DRAWING_COLORS,
  STROKE_WIDTHS,
  DEFAULT_DRAWING_SETTINGS,
  TOOL_TYPES,
  CANVAS_CONFIG,
} from "../constants";
import type { Line as LineType, ToolType, DrawingColor, StrokeWidth } from "../types/types";

interface CanvaProps {
  isDrawer: boolean;
  roomId: string;
}

const Canva = ({ isDrawer, roomId }: CanvaProps) => {
  const [tool, setTool] = useState<ToolType>(DEFAULT_DRAWING_SETTINGS.tool);
  const [lines, setLines] = useState<LineType[]>([]);
  const [color, setColor] = useState<DrawingColor>(DEFAULT_DRAWING_SETTINGS.color);
  const [strokeWidth, setStrokeWidth] = useState<StrokeWidth>(DEFAULT_DRAWING_SETTINGS.strokeWidth);
  const isDrawing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 480 });
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        if (w > 0) setStageSize({ width: w, height: Math.max(360, Math.round(w * 0.65)) });
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
      const w = Math.floor(containerRef.current.getBoundingClientRect().width);
      if (w > 0) setStageSize({ width: w, height: Math.max(360, Math.round(w * 0.65)) });
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    socket.on("clear_canvas", () => {
      setLines([]);
    });

    socket.on("receive_line", (line, newLine) => {
      setLines((prev) => {
        if (newLine) {
          // Start a new line
          return [...prev, line];
        } else if (
          prev.length > 0 &&
          prev[prev.length - 1].tool === line.tool
        ) {
          // Merge with last line
          const merged = {
            ...prev[prev.length - 1],
            points: line.points,
          };
          return [...prev.slice(0, -1), merged];
        } else {
          return [...prev, line];
        }
      });
    });

    socket.on("turn_ended", () => {
      setLines([]);
    });

    return () => {
      socket.off("clear_canvas");
      socket.off("turn_ended");
      socket.off("receive_line");
    };
  }, []);
  const handleMouseDown = (e: any) => {
    if (!isDrawer) return;
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    const newLine = { tool, points: [pos.x, pos.y], color, strokeWidth };
    setLines((prev) => [...prev, newLine]);
    socket.emit("send_line", {
      line: newLine,
      roomCode: roomId,
      newLine: true,
    });
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawer || !isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    setLines((prev) => {
      const last = prev[prev.length - 1];
      const updated = { 
        ...last, 
        points: [...last.points, point.x, point.y],
        color: last.color,
        strokeWidth: last.strokeWidth
      };
      const newLines = [...prev.slice(0, -1), updated];

      socket.emit("send_line", { line: updated, roomCode: roomId, newLine: false });
      return newLines;
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleClearCanvas = () => {
    setLines([]);
    socket.emit("clear_canvas", { roomCode: roomId });
  };

  return (
    <div className="bg-[#1e293b] border-2 border-[#8b5cf6] rounded-lg p-2 sm:p-4 mb-4 shadow-xl">
      {isDrawer ? (
        <div className="mb-3 flex items-center justify-between gap-2">
          {/* Scrollable toolbar */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex items-center gap-3 min-w-max pr-2">
              {/* Tool Selection */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => setTool(TOOL_TYPES.PEN)}
                  className={`px-2 sm:px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                    tool === TOOL_TYPES.PEN
                      ? "bg-[#373047] border-[#4b3c6e] text-white shadow-lg"
                      : "bg-[#0f172a] border-[#334155] text-[#cbd5e1] hover:border-[#8b5cf6]"
                  }`}
                  title="Pen"
                >
                  ✏️ <span className="hidden sm:inline">Pen</span>
                </button>
                <button
                  onClick={() => setTool(TOOL_TYPES.ERASER)}
                  className={`px-2 sm:px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                    tool === TOOL_TYPES.ERASER
                      ? "bg-[#373047] border-[#4b3c6e] text-white shadow-lg"
                      : "bg-[#0f172a] border-[#334155] text-[#cbd5e1] hover:border-[#8b5cf6]"
                  }`}
                  title="Eraser"
                >
                  🧹 <span className="hidden sm:inline">Eraser</span>
                </button>
              </div>

              {/* Color Picker - Only show when pen is selected */}
              {tool === TOOL_TYPES.PEN && (
                <>
                  <div className="h-6 w-px bg-[#334155] shrink-0"></div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      {DRAWING_COLORS.map(({ hex, name }) => (
                        <button
                          key={hex}
                          onClick={() => setColor(hex)}
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 transition-all hover:scale-110 ${
                            color === hex ? "border-[#06b6d4] ring-2 ring-[#06b6d4] ring-offset-1 ring-offset-[#1e293b]" : "border-[#334155]"
                          }`}
                          style={{ backgroundColor: hex }}
                          title={name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="h-6 w-px bg-[#334155] shrink-0"></div>

                  {/* Stroke Width Picker */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1.5">
                      {STROKE_WIDTHS.map((width) => (
                        <button
                          key={width}
                          onClick={() => setStrokeWidth(width)}
                          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all hover:scale-110 ${
                            strokeWidth === width
                              ? "bg-[#06b6d4] border-[#06b6d4] text-white"
                              : "bg-[#0f172a] border-[#334155] text-[#cbd5e1] hover:border-[#06b6d4]"
                          }`}
                          title={`${width}px`}
                        >
                          <div
                            className="rounded-full"
                            style={{
                              width: `${Math.min(width, 16)}px`,
                              height: `${Math.min(width, 16)}px`,
                              backgroundColor: strokeWidth === width ? "white" : "#cbd5e1",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Clear Button */}
          <button
            onClick={handleClearCanvas}
            className="arcade-button bg-[#f97316] text-white px-2 sm:px-4 py-2 border-[#f97316] hover:bg-[#ea580c] text-sm whitespace-nowrap shrink-0"
          >
            🗑️ <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      ) : (
        <div className="mb-3 bg-[#0f172a] border border-[#f59e0b] rounded-lg p-2.5 text-center">
          <p className="text-[#f59e0b] text-sm font-semibold">👀 Spectator Mode - Watch and guess!</p>
        </div>
      )}
      <div
        ref={containerRef}
        className="border-2 border-[#06b6d4] rounded-lg overflow-hidden bg-white"
        style={{ cursor: isDrawer ? "crosshair" : "not-allowed" }}
      >
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            <Text
              text={CANVAS_CONFIG.placeholderText}
              x={10}
              y={30}
              fontSize={CANVAS_CONFIG.placeholderSize}
              fill={CANVAS_CONFIG.placeholderColor}
              fontFamily={CANVAS_CONFIG.placeholderFont}
            />
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === TOOL_TYPES.ERASER ? "destination-out" : "source-over"
                }
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Canva;
