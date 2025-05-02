"""
This module provides a service for ChromaDB vector storage operations.
"""

import logging
from typing import List, Optional

import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions

from core.embedding.embedding_model import VectorData, VectorMetadata
from settings.config import settings


class ChromaService:
    """Service for ChromaDB vector storage operations."""

    def __init__(self, collection_name: Optional[str] = None):
        """Initialize the ChromaDB service.

        Args:
            collection_name: Optional name of the collection to use. If not provided,
                           will use the default from settings.
        """
        self.logger = logging.getLogger(__name__)
        self.collection_name = collection_name or settings.CHROMA_DB_COLLECTION
        self.client = self._init_client()
        self.collection = self._init_collection()

    def _init_client(self) -> chromadb.Client:
        """Initialize the ChromaDB client."""
        # Use the same embedding function as our embedding service
        self.embedding_function = (
            embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
            )
        )
        self.logger.info(
            "Initialized embedding function: %s",
            self.embedding_function.__class__.__name__,
        )

        # Initialize client with HTTP connection using settings
        return chromadb.HttpClient(
            host=settings.CHROMA_DB_HOST,
            port=settings.CHROMA_DB_PORT,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True,
            ),
        )

    def _init_collection(self) -> chromadb.Collection:
        """Initialize or get the collection."""
        try:
            # List all collections
            collections = self.client.list_collections()
            self.logger.info("Found %d collections", len(collections))

            # Check if our collection exists
            for collection in collections:
                if collection.name == self.collection_name:
                    self.logger.info(
                        "Found existing collection: %s", self.collection_name
                    )
                    return collection

            # If not found, create new collection
            self.logger.info("Creating new collection: %s", self.collection_name)
            return self.client.create_collection(
                name=self.collection_name,
                embedding_function=self.embedding_function,
                metadata={"description": "Transcription segment embeddings"},
            )
        except Exception as e:
            self.logger.error("Error initializing collection: %s", str(e))
            raise

    def store_vectors(self, vectors: List[VectorData]) -> None:
        """Store a list of vectors in the collection.

        Args:
            vectors: List of VectorData objects to store
        """
        try:
            # Prepare data for ChromaDB
            ids = [f"segment_{i}" for i in range(len(vectors))]
            documents = [vector.text for vector in vectors]
            embeddings = [vector.embedding for vector in vectors]
            metadatas = [vector.metadata.model_dump() for vector in vectors]

            # Add to collection
            self.collection.add(
                ids=ids,
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
            )

            self.logger.info("Successfully stored %d vectors", len(vectors))

        except Exception as e:
            self.logger.error("Error storing vectors: %s", str(e))
            raise

    def query_vectors(
        self,
        query_text: str,
        n_results: int = 5,
        where: Optional[dict] = None,
    ) -> List[VectorData]:
        """Query vectors from the collection.

        Args:
            query_text: Text to query
            n_results: Number of results to return
            where: Optional metadata filter

        Returns:
            List of VectorData objects
        """
        try:
            self.logger.info("Querying ChromaDB with text: %s", query_text)
            self.logger.info("Collection name: %s", self.collection_name)
            self.logger.info(
                "Number of vectors in collection: %d", self.collection.count()
            )

            # Query with explicit parameters
            results = self.collection.query(
                query_texts=[query_text],
                n_results=n_results,
                where=where,
                include=["documents", "embeddings", "metadatas", "distances"],
            )

            # Log the structure of the results
            self.logger.debug(
                "Results structure: %s", {k: type(v) for k, v in results.items()}
            )
            self.logger.debug("Results content: %s", results)

            # Check if we got any results
            if results is None:
                self.logger.warning("ChromaDB returned None for query: %s", query_text)
                return []

            if not isinstance(results, dict):
                self.logger.error(
                    "Unexpected ChromaDB response type: %s", type(results)
                )
                return []

            # Check each required field
            required_fields = ["ids", "documents", "embeddings", "metadatas"]
            for field in required_fields:
                if field not in results:
                    self.logger.error(
                        "Missing required field in ChromaDB response: %s", field
                    )
                    return []

                # Check if the field is a list and has at least one element
                if not isinstance(results[field], list) or len(results[field]) == 0:
                    self.logger.warning(
                        "Invalid %s in ChromaDB response: %s",
                        field,
                        type(results[field]),
                    )
                    return []

                # For embeddings, we accept both lists and numpy arrays
                if field == "embeddings":
                    if (
                        not hasattr(results[field][0], "__len__")
                        or len(results[field][0]) == 0
                    ):
                        self.logger.warning(
                            "Invalid embeddings format: %s", type(results[field][0])
                        )
                        return []
                else:
                    # For other fields, we expect lists
                    if (
                        not isinstance(results[field][0], list)
                        or len(results[field][0]) == 0
                    ):
                        self.logger.warning(
                            "Invalid first element in %s: %s",
                            field,
                            type(results[field][0]),
                        )
                        return []

            # Log the number of results found
            num_results = len(results["ids"][0])
            self.logger.info("Found %d results", num_results)

            # Convert results to VectorData objects
            vectors = []
            for i in range(num_results):
                try:
                    # Log the structure of each result
                    self.logger.debug("Result %d structure:", i)
                    self.logger.debug(
                        "  document: %s", type(results["documents"][0][i])
                    )
                    self.logger.debug(
                        "  embedding: %s", type(results["embeddings"][0][i])
                    )
                    self.logger.debug(
                        "  metadata: %s", type(results["metadatas"][0][i])
                    )

                    vectors.append(
                        VectorData(
                            text=results["documents"][0][i],
                            embedding=results["embeddings"][0][i],
                            metadata=VectorMetadata(**results["metadatas"][0][i]),
                        )
                    )
                except Exception as e:
                    self.logger.error(
                        "Error converting result at index %d: %s", i, str(e)
                    )
                    continue

            if not vectors:
                self.logger.warning("No valid vectors could be created from results")
                return []

            self.logger.info(
                "Successfully converted %d results to vectors", len(vectors)
            )
            return vectors

        except Exception as e:
            self.logger.error("Error querying vectors: %s", str(e))
            raise
