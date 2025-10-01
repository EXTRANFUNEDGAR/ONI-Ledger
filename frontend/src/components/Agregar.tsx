// En src/components/Agregar.tsx
import styles from "./Agregar.module.css";

// Recibe la función onClick como prop
interface AgregarProps {
    onAgregarClick: () => void;
}

export default function Agregar({ onAgregarClick }: AgregarProps) {
    return (
        <div>
            <br />
            <button
                type="button"
                className={`${styles.agregar} btn btn-secondary`}
                onClick={onAgregarClick} // Llama a la función al hacer clic
            >
                Agregar
            </button>
        </div>
    );
}