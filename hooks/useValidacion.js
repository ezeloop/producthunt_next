import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'

const useValidation = ( stateInicial, validar, fn ) => {

    const [ valores, guardarValores ] = useState(stateInicial);
    const [ errores, guardarErrores ] = useState({});
    const [ submitForm, guardarSubmitForm] = useState(false);

    //porque cuando use este hook desde un componente, cuando lo haga llamar, esto pasa de false a true, como va a ser un objeto los errores
    //para revisar un objeto, uso Object.keys(errores)
    useEffect(() => {
        if(submitForm) {
            const noErrores = Object.keys(errores).length === 0;
            //al estar vacio, no hay errores

            if(noErrores) {
                fn(); //fn la funcion que va a pasar el usuario en el componente
            }
            guardarSubmitForm(false)
        }
    }, [errores]);

    //funcion que se ejecuta conforme el usuario escribe algo
    const handleChange = e => {
        guardarValores({
            ...valores,
            [e.target.name] : e.target.value
        })
    }

    //func que se ejecuta cuando el usuario hace submit
    const handleSubmit = e => {
        e.preventDefault();
        const erroresValidacion = validar(valores);
        guardarErrores(erroresValidacion);
        guardarSubmitForm(true);
        Swal.fire(
            'Correcto',
            'Producto Subido con Éxito',
            'success'
        )
    }

    //cuando se realiza el eventode blur (blur significa cuando estas en el input escribiendo y luego te salis)
    const handleBlur = () => {
        const erroresValidacion = validar(valores);
        guardarErrores(erroresValidacion);
    }

    return {
        valores,
        errores,
        handleChange,
        handleSubmit,
        handleBlur
    };
}
 
export default useValidation;