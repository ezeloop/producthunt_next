import React, { useContext } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import Buscar from '../ui/Buscar';
import Navegacion from './Navegacion';
import Boton from '../ui/Boton';
import { FirebaseContext } from '../../firebase';
import { Router } from 'next/dist/client/router';
import Icon from "@mdi/react";
import { mdiCrown } from "@mdi/js";

const ContenedorHeader = styled.div`
    max-width: 1200px;
    width: 95%;
    margin: 0 auto;
    @media (min-width: 768px){
        display: flex;
        justify-content: space-between;
    }
`
const Logo = styled.a`
    color: var(--naranja);
    font-size: 4rem;
    line-height: 0;
    font-weight: 700;
    font-family: 'Roboto Stab', serif;
    margin-right: 2rem;
`

const Header = () => {

    const { usuario, firebase } = useContext(FirebaseContext);

    const handleCerrarSesion = () => {
        firebase.cerrarSesion
        Router.push('/login')
    }

    return ( 
        <header
            css={css`
                border-bottom: 2px solid var(--gris3);
                padding: 1rem 0;
            `}
        >
            <ContenedorHeader>
                <div
                    css={css `
                        display: flex;
                        align-items: center;
                    `}
                >
                    <Link href="/">
                        <Logo>P</Logo>
                    </Link>
                    <Buscar/>
                    <Navegacion />
                </div>

                <div
                    css={css `
                        display: flex;
                        align-items: center;
                `}
                >
                    { usuario ? (
                        <>
                            <p
                            css={css `
                                margin-right: 2rem;
                                display: grid;
                                grid-template-columns: 1fr;
                                grid-template-rows: 1fr 1fr;
                                    justify-content: center;
                            `}
                            >
                            {<Icon
                                        path={mdiCrown}
                                        title="Creador"
                                        size={2}
                                        color="#fdb827"
                                        css= { css `
                                          margin: auto;
                                        `}
                />}
                           Hola: {usuario.displayName}</p>
                            <Boton 
                            bgColor="true"
                            onClick={() => firebase.cerrarSesion()}
                            >Cerrar Sesión</Boton>
                        </>
                    )
                    :
                    (
                        <>
                            <Link href="/login">
                                <Boton
                                    bgColor="true"
                                >Login</Boton>
                            </Link>
                            <Link href="/crear-cuenta">
                                <Boton>Crear Cuenta</Boton>
                            </Link>
                        </>
                    )}
                </div>
            </ContenedorHeader>
        </header>
     );
}
 
export default Header;