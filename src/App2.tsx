
import './App2.css'
import CarbonComponent from './components/Carbon/Carbon';
import LineChart from './components/LineChart/LineChart';
import LineChartChange from './components/LineChartChange/LineChartChange';
import PieChart from './components/PieChart/PieChart'

function App() {

  const dataPie = { labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'], values: [12, 19, 3, 5, 2, 3] };
  const chartData = {
    labels: ['Etapa 1', 'Etapa 2', 'Etapa 3', 'Etapa 4', 'Etapa 5'],
    noConformes: [10, 15, 5, 20, 25],  // Datos de no conformes
    salidas: [5, 10, 15, 5, 10],  // Datos de salidas
  };

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
    <>
      <h1>Hello World!</h1>
      <PieChart data={dataPie} />
      <LineChart data={chartData} />
      <CarbonComponent name={"Carbon"} id={1} inputs={5} outputs={5}></CarbonComponent>
      <LineChartChange 
        data={{
          noConformes: weekData.map(item => item.noConformes),
          salidas: weekData.map(item => item.salidas),
          num_procesos: weekData.map(item => item.num_procesos),
        }} 
        timeFrame="week" 
      />

      </>
  )
}

export default App
