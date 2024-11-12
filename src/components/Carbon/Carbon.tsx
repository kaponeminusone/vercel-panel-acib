import './Carbon.css';

interface CarbonComponentProps {
  name: string;
  id: number;
  inputs: number;
  outputs: number;
}

export default function CarbonComponent({ name, id, inputs, outputs }: CarbonComponentProps) {
  const total = inputs + outputs;
  const inputPercentage = total > 0 ? (inputs / total) * 80 + 10 : 10; // Al menos 10%
  const outputPercentage = total > 0 ? (outputs / total) * 80 + 10 : 10; // Al menos 10%

  // Asegúrate de que la suma de las porcentajes no exceda 100%
  const totalPercentage = inputPercentage + outputPercentage > 100 ? 100 : inputPercentage + outputPercentage;

  // Ajustamos los porcentajes finales
  const adjustedInputPercentage = (inputPercentage / totalPercentage) * 100;
  const adjustedOutputPercentage = (outputPercentage / totalPercentage) * 100;

  const hasInputBorder = inputs > outputs;
  const hasOutputBorder = outputs > inputs;

  return (
    <div className="carbon-component">
      <div className="carbon-header">
        <span className="carbon-name">{name}</span>
        <span className="carbon-id">#{id}</span>
      </div>
      <div className="carbon-bar">
        <div 
          className="carbon-input"
          style={{ 
            width: `${adjustedInputPercentage}%`,
            zIndex: hasInputBorder ? 2 : 1,
            borderTopRightRadius: hasInputBorder ? '1rem' : '0',
            borderBottomRightRadius: hasInputBorder ? '1rem' : '0',
            paddingLeft: !hasInputBorder && !hasOutputBorder ? '0px' : '8px',
          }}
          title={`Entrada: ${inputs}`}  // Tooltip simple
        >
          <span className="carbon-value" style={{ position: 'absolute', left: '5px', whiteSpace: 'nowrap' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="carbon-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>{inputs}</span>
          </span>
        </div>
        <div 
          className="carbon-output"
          style={{ 
            width: `${adjustedOutputPercentage}%`,
            zIndex: hasOutputBorder ? 2 : 1,
            borderTopLeftRadius: hasOutputBorder ? '1rem' : '0',
            borderBottomLeftRadius: hasOutputBorder ? '1rem' : '0',
            paddingRight: !hasInputBorder && !hasOutputBorder  ? '0px' : '8px',
          }}
          title={`Salida: ${outputs}`}  // Tooltip simple
        >
          <span className="carbon-value" style={{ position: 'absolute', right: '5px', whiteSpace: 'nowrap' }}>
            <span>{outputs}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="carbon-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
