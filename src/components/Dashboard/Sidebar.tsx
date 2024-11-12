import React from 'react';
import './Sidebar.css';
import LineChartChange from '../LineChartChange/LineChartChange';

const Sidebar: React.FC = () => {
  const weekData = [
    { noConformes: 3, salidas: 10, num_procesos: 1 },
    { noConformes: 4, salidas: 15, num_procesos: 2 },
    { noConformes: 2, salidas: 8, num_procesos: 1 },
    { noConformes: 5, salidas: 20, num_procesos: 3 },
    { noConformes: 1, salidas: 2, num_procesos: 1 },
    { noConformes: 0, salidas: 0, num_procesos: 0 },
    { noConformes: 4, salidas: 12, num_procesos: 3 },
  ];

  return (
    <div className="sidebar">
      <h1>DASHBOARD</h1>
      <input 
        type="text" 
        placeholder="Buscar..." 
        className="search-input" 
      />
      <h2>Últimos procesos</h2>
      <div className="recent-processes">
        {[
          'Producción de Jabón',
          'Envasado de Productos',
          'Mezcla de Ingredientes',
          'Control de Calidad',
          'Mantenimiento de Maquinaria',
          'Gestión de Inventarios',
          'Logística de Distribución'
        ].map((process, index) => (
          <div key={index} className="card">
            <div className="card-header">
              <div>
                <p className="card-time">10:10 Thur</p>
                <p className="card-title">{process}</p>
                <p className="card-subtitle">Usuario encargado</p>
              </div>
              <div className="card-tags">
                <span className="tag blue-tag">1</span>
                <span className="tag green-tag">2</span>
                {index === 1 && (
                  <>
                    <span className="tag yellow-tag">3</span>
                    <span className="tag red-tag">24</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* <h2>Gráfica de procesos x día, producciones x fallas</h2>
      <div className="process-graph">
        <div className="chart-placeholder-sidebar">
          <LineChartChange 
            data={{
              noConformes: weekData.map(item => item.noConformes),
              salidas: weekData.map(item => item.salidas),
              num_procesos: weekData.map(item => item.num_procesos),
            }} 
            timeFrame="week" 
          />
        </div>
      </div> */}
    </div>
  );
};

export default Sidebar;
