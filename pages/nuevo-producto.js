import React, { useState, useContext } from 'react';
import Layout from '../components/layout/Layout';
import Router, { useRouter } from 'next/router';
import FileUploader from "react-firebase-file-uploader";
import { css } from '@emotion/react';
import { Formulario, Campo, InputSubmit, Error } from '../components/ui/Formulario';
import Error404 from '../components/layout/404';

//importo firebase 
import { FirebaseContext } from '../firebase'

//validaciones
import useValidacion from '../hooks/useValidacion';
import validarCrearProducto from '../validacion/validarCrearProducto';

const STATE_INICIAL = {
  nombre: '',
  empresa: '',
  imagen: '',
  url: '',
  descripcion: ''
}

const NuevoProducto = () => {
  
   // state de las imagenes
   const [urlimagen, guardarUrlImagen] = useState('');
 
   const [ error, guardarError] = useState(false);
 
   const { valores, errores, handleSubmit, handleChange, handleBlur } = useValidacion(STATE_INICIAL, validarCrearProducto, crearProducto);
 
   const { nombre, empresa, imagen, url, descripcion } = valores;
 
   // hook de routing para redireccionar
   const router = useRouter();
 
   // context con las operaciones crud de firebase
   const { usuario, firebase } = useContext(FirebaseContext);



  async function crearProducto() {
    //si el user no esta autenticado llevar al login

    if(!usuario){
      return router.push('/login');
    }

    //crear el objeto de nuevo producto, porq hay que agregar que va a tener puntuacion y votos...
    const producto = {
      nombre,
      empresa,
      url,
      urlimagen,
      descripcion, //estos de aca arriba ya vienen, pero los de abajo, los creo
      votos: 0,
      comentarios: [],
      creado: Date.now(),
      creador: {
        id: usuario.uid,
        nombre: usuario.displayName
      },
      haVotado: []
    }
    
    //insertarlo en la base de datos
    firebase.db.collection('productos').add(producto);
    
    return router.push('/')
  }


const onChangeImg = e => {
  const file = e.target.files[0]
  const storageRef = firebase.storage.ref()
  storageRef.child(file.name).put(file).then( () => {
    console.log("uploaded file")
    console.log(fileRef)
  const fileRef = storageRef.child(file.name).getDownloadURL().then(url => {
    console.log(url);
    guardarUrlImagen(url);
  } );
  
   
 })
}
 
  return (
    <div>
      <Layout>
      { !usuario ? <Error404/> : (
        <>
        <h1
          css={css`
            text-align: center;
            margin-top: 5rem;

          `}
        >Nuevo Producto</h1>
        <Formulario
          onSubmit={handleSubmit}
          noValidate
        >
                      <fieldset>
            <legend>Infomación General</legend>
            <Campo>
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  placeholder="Nombre del Producto"
                  name="nombre"
                  value={nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
            </Campo>

            {errores.nombre && <Error>{errores.nombre}</Error>}
            
            <Campo>
                <label htmlFor="empresa">Empresa</label>
                <input
                  type="text"
                  id="empresa"
                  placeholder="Nombre Empresa o Compañía"
                  name="empresa"
                  value={empresa}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
            </Campo>

            {errores.empresa && <Error>{errores.empresa}</Error>}

            <Campo>
                    <label htmlFor="imagen">Imagen</label>
                    <input 
                        type="file"
                        id="imagen"
                        name="imagen"
                        onChange={onChangeImg}
                    />
                </Campo>


            <Campo>
                <label htmlFor="url">URL</label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  placeholder="URL de tu producto"
                  value={url}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
            </Campo>

            {errores.url && <Error>{errores.url}</Error>}

            </fieldset>
            
            <fieldset>
              <legend>Sobre tu Producto</legend>

              <Campo>
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={descripcion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
            </Campo>

            {errores.descripcion && <Error>{errores.descripcion}</Error>}
            </fieldset>

            { error && <Error>{error}</Error>}

            <InputSubmit 
              type="submit"
              value="Crear Producto"
            />
        </Formulario>
        </>
      ) }
        
      </Layout>
      
    </div>
  )
}
export default NuevoProducto
