import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Html, TransformControls } from '@react-three/drei';
import type { Mesh } from 'three';
import './App.css';

type Mode = 'owner' | 'guest';

type Table = {
  id: string;
  name: string;
  seats: number;
  position: [number, number, number];
  pricePerHour: number;
  activeHours: string;
  reservedBy?: string;
  reservationTime?: string;
  notes?: string;
};

const defaultTables: Table[] = [
  {
    id: 't1',
    name: 'Atrium A',
    seats: 4,
    position: [-4, 0.15, -2],
    pricePerHour: 25,
    activeHours: '17:00 - 23:00'
  },
  {
    id: 't2',
    name: 'Atrium B',
    seats: 2,
    position: [0, 0.15, -1],
    pricePerHour: 18,
    activeHours: '12:00 - 22:00'
  },
  {
    id: 't3',
    name: 'Chef\'s Table',
    seats: 6,
    position: [3.5, 0.15, 1],
    pricePerHour: 40,
    activeHours: '18:00 - 00:00'
  }
];

type TableMeshProps = {
  table: Table;
  isSelected: boolean;
  mode: Mode;
  onSelect: (id: string) => void;
  onUpdatePosition: (id: string, position: [number, number, number]) => void;
};

function TableMesh({ table, isSelected, mode, onSelect, onUpdatePosition }: TableMeshProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<Mesh>(null);

  useEffect(() => {
    if (meshRef.current) {
      const [x, y, z] = table.position;
      meshRef.current.position.set(x, y, z);
    }
  }, [table.position]);

  const tableColor = useMemo(() => {
    if (table.reservedBy) return '#f97316';
    return '#38bdf8';
  }, [table.reservedBy]);

  const handlePointer = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(table.id);
  };

  const mesh = (
    <mesh
      ref={meshRef}
      position={table.position}
      onClick={handlePointer}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
    >
      <cylinderGeometry args={[1.1, 1.1, 0.3, 32]} />
      <meshStandardMaterial
        color={isSelected ? '#facc15' : tableColor}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );

  const selectedMesh = (
    <TransformControls
      mode="translate"
      enabled={mode === 'owner'}
      showX
      showY={false}
      showZ
      onMouseUp={() => {
        const object = meshRef.current;
        if (!object) return;
        const { x, y, z } = object.position;
        onUpdatePosition(table.id, [x, y, z]);
      }}
    >
      {mesh}
    </TransformControls>
  );

  return (
    <group>
      {mode === 'owner' && isSelected ? selectedMesh : mesh}
      <Html
        position={[table.position[0], table.position[1] + 1.4, table.position[2]]}
        center
        className={`table-label ${hovered ? 'table-label--hovered' : ''}`}
      >
        <div>
          <strong>{table.name}</strong>
          <div>{table.seats} seats</div>
          <div>${table.pricePerHour.toFixed(0)}/hr</div>
          {table.reservedBy ? <div className="status status--reserved">Reserved</div> : <div className="status status--open">Open</div>}
        </div>
      </Html>
    </group>
  );
}

function useTableActions(initialTables: Table[]) {
  const [tables, setTables] = useState<Table[]>(initialTables);

  const updateTable = (id: string, updates: Partial<Table>) => {
    setTables((prev) => prev.map((table) => (table.id === id ? { ...table, ...updates } : table)));
  };

  const updatePosition = (id: string, position: [number, number, number]) => {
    setTables((prev) => prev.map((table) => (table.id === id ? { ...table, position } : table)));
  };

  const addTable = () => {
    setTables((prev) => [
      ...prev,
      {
        id: `t${prev.length + 1}`,
        name: `New Lounge ${prev.length + 1}`,
        seats: 2,
        position: [Math.random() * 6 - 3, 0.15, Math.random() * 6 - 3],
        pricePerHour: 15,
        activeHours: '10:00 - 22:00'
      }
    ]);
  };

  return {
    tables,
    setTables,
    updateTable,
    updatePosition,
    addTable
  };
}

function OwnerPanel({
  tables,
  selectedTable,
  onSelectTable,
  onUpdateTable,
  onAddTable
}: {
  tables: Table[];
  selectedTable?: Table;
  onSelectTable: (id: string) => void;
  onUpdateTable: (id: string, updates: Partial<Table>) => void;
  onAddTable: () => void;
}) {
  return (
    <div className="panel">
      <div className="panel__header">
        <h2>Designer Toolkit</h2>
        <p>Drag tables in the 3D scene to layout your dining room. Update pricing, hours and seating here.</p>
        <button className="btn btn--primary" onClick={onAddTable}>Add immersive table</button>
      </div>
      <div className="panel__content">
        <h3>Tables</h3>
        <div className="list">
          {tables.map((table) => (
            <button
              key={table.id}
              className={`list__item ${selectedTable?.id === table.id ? 'list__item--active' : ''}`}
              onClick={() => onSelectTable(table.id)}
            >
              <span>{table.name}</span>
              <span>{table.seats} seats</span>
            </button>
          ))}
        </div>
        {selectedTable ? (
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <h3>Configuration</h3>
            <label>
              Display name
              <input
                type="text"
                value={selectedTable.name}
                onChange={(event) => onUpdateTable(selectedTable.id, { name: event.target.value })}
              />
            </label>
            <label>
              Seats
              <input
                type="number"
                min={1}
                value={selectedTable.seats}
                onChange={(event) => onUpdateTable(selectedTable.id, { seats: Number(event.target.value) })}
              />
            </label>
            <label>
              Price per hour ($)
              <input
                type="number"
                min={0}
                value={selectedTable.pricePerHour}
                onChange={(event) => onUpdateTable(selectedTable.id, { pricePerHour: Number(event.target.value) })}
              />
            </label>
            <label>
              Active hours
              <input
                type="text"
                value={selectedTable.activeHours}
                onChange={(event) => onUpdateTable(selectedTable.id, { activeHours: event.target.value })}
              />
            </label>
            <label>
              Notes
              <textarea
                placeholder="E.g. VIP experience, corner booth..."
                value={selectedTable.notes ?? ''}
                onChange={(event) => onUpdateTable(selectedTable.id, { notes: event.target.value })}
              />
            </label>
          </form>
        ) : (
          <div className="empty">Select a table to edit its details.</div>
        )}
      </div>
    </div>
  );
}

function BookingPanel({
  tables,
  selectedTable,
  onSelectTable,
  onBook,
  onRelease
}: {
  tables: Table[];
  selectedTable?: Table;
  onSelectTable: (id: string) => void;
  onBook: (id: string, payload: { reservedBy: string; reservationTime: string }) => void;
  onRelease: (id: string) => void;
}) {
  const [guestName, setGuestName] = useState('');
  const [guestTime, setGuestTime] = useState('19:00');

  const handleBook = () => {
    if (!selectedTable) return;
    if (!guestName.trim()) {
      alert('Please add your name to reserve this table.');
      return;
    }

    onBook(selectedTable.id, { reservedBy: guestName.trim(), reservationTime: guestTime });
    setGuestName('');
  };

  return (
    <div className="panel">
      <div className="panel__header">
        <h2>Book your scene</h2>
        <p>Pick a table from the 3D map and lock in your dining experience instantly.</p>
      </div>
      <div className="panel__content">
        <div className="list list--cards">
          {tables.map((table) => (
            <button
              key={table.id}
              className={`list-card ${selectedTable?.id === table.id ? 'list-card--active' : ''}`}
              onClick={() => onSelectTable(table.id)}
            >
              <h4>{table.name}</h4>
              <p>{table.seats} seats · Active {table.activeHours}</p>
              <strong>${table.pricePerHour.toFixed(0)}/hr</strong>
              <div className={`chip ${table.reservedBy ? 'chip--reserved' : 'chip--available'}`}>
                {table.reservedBy ? `Reserved by ${table.reservedBy}` : 'Available'}
              </div>
            </button>
          ))}
        </div>
        {selectedTable ? (
          <div className="booking">
            <h3>Reserve {selectedTable.name}</h3>
            <label>
              Your name
              <input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Sofia" />
            </label>
            <label>
              Preferred time
              <input value={guestTime} onChange={(event) => setGuestTime(event.target.value)} placeholder="19:00" />
            </label>
            <div className="booking__actions">
              <button
                className="btn btn--primary"
                onClick={handleBook}
                disabled={Boolean(selectedTable.reservedBy)}
              >
                {selectedTable.reservedBy ? 'Already reserved' : 'Confirm reservation'}
              </button>
              {selectedTable.reservedBy && (
                <button className="btn" onClick={() => onRelease(selectedTable.id)}>Release table</button>
              )}
            </div>
          </div>
        ) : (
          <div className="empty">Select a table to start booking.</div>
        )}
      </div>
    </div>
  );
}

function Scene({
  tables,
  mode,
  selectedTableId,
  onSelect,
  onUpdatePosition
}: {
  tables: Table[];
  mode: Mode;
  selectedTableId?: string;
  onSelect: (id: string) => void;
  onUpdatePosition: (id: string, position: [number, number, number]) => void;
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [8, 8, 8], fov: 45 }}
      onPointerMissed={() => onSelect('')}
    >
      <color attach="background" args={[0.05, 0.1, 0.14]} />
      <ambientLight intensity={0.5} />
      <spotLight
        position={[10, 15, 10]}
        angle={0.5}
        penumbra={1}
        intensity={1.2}
        castShadow
      />
      <pointLight position={[-6, 5, -6]} intensity={0.5} />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0f172a" metalness={0.1} roughness={0.6} />
      </mesh>
      <gridHelper args={[30, 30, '#1d4ed8', '#1e293b']} position={[0, 0.01, 0]} />
      <group position={[0, 0, 0]}>
        {tables.map((table) => (
          <TableMesh
            key={table.id}
            table={table}
            isSelected={selectedTableId === table.id}
            mode={mode}
            onSelect={(id) => onSelect(id)}
            onUpdatePosition={onUpdatePosition}
          />
        ))}
      </group>
      <OrbitControls enablePan enableDamping enableRotate maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  );
}

function App() {
  const { tables, updateTable, updatePosition, addTable } = useTableActions(defaultTables);
  const [mode, setMode] = useState<Mode>('guest');
  const [selectedTableId, setSelectedTableId] = useState<string>('');

  const selectedTable = tables.find((table) => table.id === selectedTableId);

  const handleBook = (id: string, payload: { reservedBy: string; reservationTime: string }) => {
    updateTable(id, payload);
  };

  const handleRelease = (id: string) => {
    updateTable(id, { reservedBy: undefined, reservationTime: undefined });
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <header className="sidebar__header">
          <h1>HaloTables</h1>
          <p>Design visionary dining rooms and let guests reserve from the same immersive 3D scene.</p>
          <div className="toggle">
            <button
              className={`toggle__button ${mode === 'owner' ? 'toggle__button--active' : ''}`}
              onClick={() => setMode('owner')}
            >
              Owner studio
            </button>
            <button
              className={`toggle__button ${mode === 'guest' ? 'toggle__button--active' : ''}`}
              onClick={() => setMode('guest')}
            >
              Guest booking
            </button>
          </div>
        </header>
        {mode === 'owner' ? (
          <OwnerPanel
            tables={tables}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTableId}
            onUpdateTable={updateTable}
            onAddTable={() => {
              addTable();
            }}
          />
        ) : (
          <BookingPanel
            tables={tables}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTableId}
            onBook={handleBook}
            onRelease={handleRelease}
          />
        )}
      </aside>
      <main className="stage">
        <Scene
          tables={tables}
          mode={mode}
          selectedTableId={selectedTableId}
          onSelect={(id) => setSelectedTableId(id)}
          onUpdatePosition={updatePosition}
        />
        <div className="stage__overlay">
          <div>
            <h2>Immersive floor plan</h2>
            <p>Orbit, zoom and drag to choreograph your restaurant layout in full 3D.</p>
          </div>
          <div className="legend">
            <span className="legend__item legend__item--available">Available</span>
            <span className="legend__item legend__item--reserved">Reserved</span>
            <span className="legend__item legend__item--selected">Selected</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
