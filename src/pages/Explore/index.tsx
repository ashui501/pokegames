/* eslint-disable react-hooks/exhaustive-deps */
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useState, createRef, useEffect } from "react";

import { useGlobalContext } from "../../context";
import { IPokemon } from "../../types/pokemon";
import { Text, Button, Loading, Navbar, PokeCard } from "../../components";

import { getPokemonId } from "../../utils";
import { POKEMON_API } from "../../configs/api";

import * as T from "./index.style";
import { getAllPokemon } from "../../services/pokemon";

const Explore = () => {
  const { state, setState } = useGlobalContext();
  const navRef = createRef<HTMLDivElement>();

  const [pokeUrl, setPokeURL] = useState<string>(`${POKEMON_API}?limit=50&offset=0`);
  const [isFetchingPokemon, setIsFetchingPokemon] = useState<boolean>(false);
  const [navHeight, setNavHeight] = useState<number>(0);

  async function loadPokemons() {
    if (pokeUrl) {
      try {
        setIsFetchingPokemon(true);

        const response = await getAllPokemon(50, state?.pokemons?.length || 0);

        const filteredSummary =
          response?.results?.map((result) => {
            const summaryIdx =
              state?.pokeSummary?.findIndex((el) => el.name === result.name.toUpperCase()) || 0;
            return {
              name: result.name,
              url: result.url,
              captured: state?.pokeSummary?.[summaryIdx]?.captured ?? 0,
            };
          }) || [];

        setState({ pokemons: [...(state.pokemons || []), ...filteredSummary] });
        setPokeURL(response?.next || "");
        setIsFetchingPokemon(false);
      } catch (error) {
        toast.error("Oops!. Fail get pokemons. Please try again!");
        setIsFetchingPokemon(false);
      }
    }
  }

  useEffect(() => {
    setNavHeight(navRef.current?.clientHeight as number);
    if (!state.pokemons?.length) {
      loadPokemons();
    }
  }, []);

  return (
    <>
      <T.Container style={{ marginBottom: navHeight }}>
        <Text as="h1" variant="darker" size="lg">
          Challenge &amp; catch them all
        </Text>
        <T.Grid>
          {state?.pokemons?.length
            ? state?.pokemons.map((pokemon: IPokemon) => (
                <Link
                  key={`${pokemon.name}-${Math.random()}`}
                  to={`/pokemon/${pokemon?.name}`}
                  style={{ display: "flex" }}>
                  <PokeCard
                    pokemonId={getPokemonId(pokemon?.url ?? "")}
                    name={pokemon?.name}
                    captured={pokemon?.captured}
                  />
                </Link>
              ))
            : null}
        </T.Grid>
        {!isFetchingPokemon ? (
          pokeUrl && (
            <T.Footer>
              <Button onClick={() => loadPokemons()}>Load More</Button>
            </T.Footer>
          )
        ) : (
          <Loading label="Please wait..." />
        )}
      </T.Container>

      <Navbar ref={navRef} />
    </>
  );
};

export default Explore;
