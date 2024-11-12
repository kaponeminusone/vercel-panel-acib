import React from 'react'
import './MainContent.css'
import LineChart from '../LineChart/LineChart'
import CarbonComponent from '../Carbon/Carbon'
import PieChart from '../PieChart/PieChart'

const MainContent: React.FC = () => {
  const lineChartData = {
    labels: ['Etapa 1', 'Etapa 2', 'Etapa 3', 'Etapa 4', 'Etapa 5'],
    noConformes: [10, 15, 5, 20, 25],
    salidas: [5, 10, 15, 5, 10],
  }

  const dataPie = { 
    labels: ['Coformes', 'No Conformes'], 
    values: [76, 300] 
  }

  const carbonData = [
    { name: 'Acero Inoxidable', id: 1, inputs: 5, outputs: 3 },
    { name: 'Aluminio', id: 2, inputs: 10, outputs: 7 },
    { name: 'Plástico PET', id: 3, inputs: 15, outputs: 10 },
    { name: 'Madera de Pino', id: 4, inputs: 8, outputs: 6 },
    { name: 'Cobre', id: 5, inputs: 4, outputs: 2 },
  ];

  return (
    <div className="main-content">
      <div className="content">
        <section className="chart-section">
          <h2>Estado general x etapas</h2>
          <div className="chart-container">
            <LineChart data={lineChartData} />
          </div>
        </section>
        <section className="chart-section">
          <h2>Estado de entradas y salidas</h2>
          <div className="carbon-container">
            {carbonData.map(item => (
              <CarbonComponent 
                key={item.id} 
                name={item.name} 
                id={item.id} 
                inputs={item.inputs} 
                outputs={item.outputs} 
              />
            ))}
          </div>
        </section>
        <div className="bottom-section">
          <section className="chart-section small">
            <h2>Diagrama de no conformidades</h2>
            <div className="chart-container">
              <PieChart data={dataPie} />
            </div>
          </section>
          <div className="process-lists">
          <div>
            <h2>Procesos con menos éxito</h2>
            <ul>
              <li>Mezcla de Compuestos</li>
              <li>Envasado de Productos</li>
              <li>Control de Calidad</li>
            </ul>
          </div>
          <div>
            <h2>Procesos con mayor éxito</h2>
            <ul>
              <li>Optimización de Producción</li>
              <li>Clasificación de Materiales</li>
              <li>Implementación de Mejora Continua</li>
            </ul>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainContent