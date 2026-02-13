import { Stage, Layer, Line, Text } from "react-konva";
import { useState, useRef, useEffect } from "react";
import socket from "../socket";

interface CanvaProps {
  isDrawer: boolean;
  roomId: string;
}

const Canva = ({ isDrawer, roomId }: CanvaProps) => {
  const [tool, setTool] = useState("pen");
  type LineType = { tool: string; points: number[] };
  const [lines, setLines] = useState<LineType[]>([]);
  const [color, setColor] = useState("black");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const isDrawing = useRef(false);
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

    return () => {
      socket.off("clear_canvas");
      socket.off("receive_line");
    };
  }, []);
  const handleMouseDown = (e: any) => {
    if (!isDrawer) return;
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    const newLine = { tool, points: [pos.x, pos.y] };
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
      const updated = { ...last, points: [...last.points, point.x, point.y] };
      const newLines = [...prev.slice(0, -1), updated];

      socket.emit("send_line", { line: updated, roomCode: roomId, newLine: false });
      return newLines;
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  return (
    <div className="bg-[#1e293b] border-2 border-[#8b5cf6] rounded-lg p-4 mb-4 shadow-xl">
      {isDrawer ? (
        <div className="mb-4 flex items-center gap-4 flex-wrap">
          <label className="text-[#f59e0b] text-sm font-semibold">Tool:</label>
          <select
            value={tool}
            onChange={(e) => {
              setTool(e.target.value);
            }}
            className="px-3 py-2"
          >
            <option value="pen">Pen</option>
            <option value="eraser">Eraser</option>
          </select></div>
      ) : (
        <div className="mb-4 bg-[#2d1b4e] border-2 border-[#f9c74f] p-3 text-center">
          <p className="text-[#f9c74f] text-[0.65rem] uppercase tracking-wide">
            ◆ SPECTATOR MODE - WATCH & GUESS! ◆
          </p>
        </div>
      )}
      <div
        className="border-4 border-[#4cc9f0] overflow-hidden bg-white"
        style={{ cursor: isDrawer ? "crosshair" : "not-allowed" }}
      >
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            <Text
              text="START DRAWING..."
              x={10}
              y={30}
              fontSize={16}
              fill="#cccccc"
              fontFamily="Press Start 2P"
            />
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={color}
                strokeWidth={strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === "eraser" ? "destination-out" : "source-over"
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
