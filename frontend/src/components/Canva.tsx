import { Stage, Layer, Line, Text } from 'react-konva';
import { useState, useRef } from 'react';

interface CanvaProps {
  isDrawer: boolean;
}

// Add states for color, strokeWidth
const Canva = ( { isDrawer }: CanvaProps) => {
  const [tool, setTool] = useState('pen');
  type LineType = { tool: string; points: number[] };
  const [lines, setLines] = useState<LineType[]>([]);
  const [color, setColor ] = useState('black');
  const [strokeWidth, setStrokeWidth] = useState(5);
  const isDrawing = useRef(false);

  const handleMouseDown = (e : any) => {
    if (!isDrawer) return; 
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e : any) => {
    if (!isDrawer) return; 
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  return (
    <div className="bg-[#16213e] border-4 border-[#7b2cbf] pixel-corners p-4 mb-4 shadow-[0_0_30px_rgba(123,44,191,0.3)]">
      {isDrawer ? (
        <div className="mb-4 flex items-center gap-4 flex-wrap">
          <label className="text-[#f9c74f] text-[0.65rem] uppercase tracking-wider">▼ TOOL:</label>
          <select
            value={tool}
            onChange={(e) => {
              setTool(e.target.value);
            }}
            className="px-3 py-2"
          >
            <option value="pen">PEN</option>
            <option value="eraser">ERASER</option>
          </select>
        </div>
      ) : (
        <div className="mb-4 bg-[#2d1b4e] border-2 border-[#f9c74f] p-3 text-center">
          <p className="text-[#f9c74f] text-[0.65rem] uppercase tracking-wide">◆ SPECTATOR MODE - WATCH & GUESS! ◆</p>
        </div>
      )}
      <div className="border-4 border-[#4cc9f0] overflow-hidden bg-white" style={{ cursor: isDrawer ? 'crosshair' : 'not-allowed' }}>
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
          <Text text="START DRAWING..." x={10} y={30} fontSize={16} fill="#cccccc" fontFamily="Press Start 2P" />
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
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
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