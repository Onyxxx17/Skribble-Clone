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
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
      {isDrawer ? (
        <div className="mb-4 flex items-center gap-4">
          <label className="font-semibold text-gray-700">Tool:</label>
          <select
            value={tool}
            onChange={(e) => {
              setTool(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pen">Pen</option>
            <option value="eraser">Eraser</option>
          </select>
        </div>
      ) : (
        <div className="mb-4 bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-center">
          <p className="text-yellow-800 font-semibold">👀 Spectator Mode - Watch and Guess!</p>
        </div>
      )}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden" style={{ cursor: isDrawer ? 'crosshair' : 'not-allowed' }}>
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
          <Text text="Just start drawing" x={5} y={30} />
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