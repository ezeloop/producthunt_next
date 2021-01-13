import React, { useEffect, useContext, useState } from "react";
import Error404 from "../../components/layout/404";
import Layout from "../../components/layout/Layout";
import { useRouter } from "next/router";
import { FirebaseContext } from "../../firebase";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Icon from "@mdi/react";
import { mdiCrown, mdiThumbUpOutline } from "@mdi/js";
import { Campo, InputSubmit } from "../../components/ui/Formulario";
import Boton from "../../components/ui/Boton";
import Swal from "sweetalert2";

const ContenedorProducto = styled.div`
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 2fr 1fr;
    column-gap: 2rem;
  }
`;

const CreadorProducto = styled.p`
  padding: 0.5rem 2rem;
  background-color: #da552f;
  color: #fff;
  text-transform: uppercase;
  font-weight: bold;
  display: inline-block;
  text-align: center;
`;

const Producto = () => {
  //state del componente
  const [producto, guardarProducto] = useState({});
  const [error, guardarError] = useState(false);
  const [palabra, guardarPalabra] = useState("");
  const [comentario, guardarComentario] = useState({});
  const [consultarDB, guardarConsultarDB] = useState(true);

  //routing para obtener el id actual
  const router = useRouter();
  const {
    query: { id },
  } = router;

  //context de firebase
  const { firebase, usuario } = useContext(FirebaseContext);

  const {
    comentarios,
    creado,
    descripcion,
    empresa,
    nombre,
    url,
    urlimagen,
    votos,
    creador,
    haVotado,
  } = producto;

  var hoy = new Date().getDate();

  var diacreado = new Date(creado).getDate();

  var resultado = hoy - diacreado;

  useEffect(() => {
    const pluralOSingular = () => {
      if (resultado === 1) {
        guardarPalabra("dia");
        return;
      }
      if (resultado > 1) {
        guardarPalabra("dias");
        return;
      }
    };
    pluralOSingular();
  }, []);

  useEffect(() => {
    if (id && consultarDB) {
      const obtenerProducto = async () => {
        const productoQuery = await firebase.db.collection("productos").doc(id);
        const producto = await productoQuery.get();
        if (producto.exists) {
          guardarProducto(producto.data());
          guardarConsultarDB(false);
        } else {
          guardarError(true);
          guardarConsultarDB(false);
        }
      };
      obtenerProducto();
    }
  }, [id]);

  if (Object.keys(producto).length === 0 && !error) {
    return (
      <Layout>
        <div
          css={css`
            background-color: #da552f;
            display: flex;
            justify-content: center;
            align-content: center;
            margin: 0;
            padding: 0;
          `}
        >
          <h1
            css={css`
              text-align: center;
              font-size: 1.7rem;
              color: white;
            `}
          >
            Cargando...
          </h1>
        </div>
      </Layout>
    );
  }
  //adm y validar votos
  const votarProducto = () => {
    if (!usuario) {
      return router.push("/login");
    }

    //obtener y sumar un nuevo voto
    const nuevoTotal = votos + 1;

    //verificar si el usuario actual ha votado
    if (haVotado.includes(usuario.uid))
      return Swal.fire(`Ya has votado`, "Es un voto por cuenta", "error");

    //guardar el id del user que ha votado
    const nuevoHaVotado = [...haVotado, usuario.uid];

    //actualizar en base de datos
    firebase.db.collection("productos").doc(id).update({
      votos: nuevoTotal,
      haVotado: nuevoHaVotado,
    });

    //actualizar el state
    guardarProducto({
      ...producto,
      votos: nuevoTotal,
    });

    guardarConsultarDB(true);
  };

  //hay un voto, asi que consultar a la base de datos

  //funciones para crear comentarios
  const comentarioChange = (e) => {
    guardarComentario({
      ...comentario,
      [e.target.name]: e.target.value,
    });
  };

  // Identifica si el comentario es del creador del producto
  const esCreador = (id) => {
    if (creador.id == id) {
      return true;
    }
  };

  const agregarComentario = (e) => {
    e.preventDefault();
    if (!usuario) {
      return router.push("/login");
    }

    //informacion extra para el comentario
    comentario.usuarioId = usuario.uid;
    comentario.usuarioNombre = usuario.displayName;

    //tomar copia de comentarios y agregar al arreglo
    const nuevosComentarios = [...comentarios, comentario];

    //actualizar la bd
    firebase.db.collection("productos").doc(id).update({
      comentarios: nuevosComentarios,
    });

    //actualizar el state
    guardarProducto({
      ...producto,
      comentarios: nuevosComentarios,
    });

    guardarConsultarDB(true); //hay un comentario, por lo tanto llamar a la db

    Swal.fire("Correcto", "Comentario subido", "success");

    guardarProducto({});
  };

  //funcion que revisa que el creador del producto sea el mismo que esta autenticado
  const puedeBorrar = () => {
    if (!usuario) return false;

    if (creador.id === usuario.uid) {
      return true;
    }
  };

  const eliminarProducto = async () => {

    if (!usuario) return router.push('/login');

    if (creador.id !== usuario.uid) {
      return router.push('/');
      }

    try {
      Swal.fire({
        title: 'Estas seguro de eliminar el Producto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirmar'
      }).then((result) => {
        if (result.isConfirmed) {
          firebase.db.collection('productos').doc(id).delete();
          Swal.fire(
            'Eliminado!',
            'Se eliminó con éxito.',
            'success'
          )
          router.push('/');
        }
      })

      
      

    } catch (error) {
      console.log(error)
    }
  }
  return (
    <Layout>
      {error ? (
        <Error404 />
      ) : (
        <div className="contenedor">
          <h1
            css={css`
              text-align: center;
              margin-top: 5rem;
            `}
          >
            {nombre}
          </h1>

          <ContenedorProducto>
            <div>
              <p>
                Publicado hace: {resultado} {palabra}
              </p>
              <p>
                Por: {creador.nombre} de {empresa}
              </p>
              <img src={urlimagen} />
              <p>{descripcion}</p>

              {usuario && (
                <>
                  <h2>Agrega tu comentario</h2>
                  <form onSubmit={agregarComentario}>
                    <Campo>
                      <input
                        type="text"
                        name="mensaje"
                        onChange={comentarioChange}
                      />
                    </Campo>
                    <InputSubmit type="submit" value="Agregar comentario" />
                  </form>
                </>
              )}

              <h2
                css={css`
                  margin: 2rem 0;
                `}
              >
                Comentarios
              </h2>

              {comentarios.length === 0 ? (
                "No hay comentarios"
              ) : (
                <ul>
                  {comentarios.map((comentario, i) => (
                    <li
                      key={`${comentario.usuarioId}-${i}`}
                      css={css`
                        border: 1px solid #e1e1e1;
                        padding: 2rem;
                      `}
                    >
                      <p>{comentario.mensaje}</p>
                      <p>
                        Escrito por:
                        <span
                          css={css`
                            font-weight: bold;
                          `}
                        >
                          {""} {comentario.usuarioNombre}
                        </span>
                      </p>
                      {esCreador(comentario.usuarioId) && (
                        <CreadorProducto
                          css={css`
                            display: flex;
                            width: 200px;
                            justify-content: center;
                            align-items: center;
                          `}
                        >
                          {
                            <Icon
                              path={mdiCrown}
                              title="Creador"
                              size={2}
                              color="#fdb827"
                              css={css`
                                margin-right: 1rem;
                              `}
                            />
                          }{" "}
                          Es Creador
                        </CreadorProducto>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <aside>
              <Boton target="_blank" bgColor="true" href={url}>
                Visitar URL
              </Boton>

              <div
                css={css`
                  margin-top: 5rem;
                `}
              >
                <p
                  css={css`
                    text-align: center;
                  `}
                >
                  {votos} Votos
                </p>
                {usuario && (
                  <Boton
                    onClick={votarProducto}
                    css={css`
                      display: flex;
                      justify-content: center;
                      align-items: center;
                    `}
                  >
                    Votar{" "}
                    {
                      <Icon
                        path={mdiThumbUpOutline}
                        title="Votar"
                        size={2}
                        color="#DA552F"
                        css={css`
                          margin-left: 1rem;
                        `}
                      />
                    }
                  </Boton>
                )}
              </div>
            </aside>
          </ContenedorProducto>

          { puedeBorrar() && 
            <Boton
              onClick={eliminarProducto}
            >Eliminar Producto</Boton>
          }
        </div>
      )}
    </Layout>
  );
};

export default Producto;
