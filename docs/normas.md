# Normas del reto que nos afectan

Fuentes: Project Submission Guide y Judging & Awards Guide de spaceappschallenge.org (consultados el 14-11-2026).

## Datos
- **Para optar a premio global hay que usar al menos un dato o recurso de NASA.** Se detalla en el campo «NASA Data».
- **Se permiten otros datos.** Se listan **todos** (datos, código, textos, imágenes, aunque sean libres) en «Space Agency Partner Data and Other References». Si algo tiene copyright, hace falta permiso.
- Se recomienda usar datos de agencias socias: ESA, CSA, JAXA, la Agencia Espacial Española, ISRO, KASA, etc.
- Criterio **Relevance**: los datos de NASA deben ser un componente central, no un añadido superficial.
- Webs que no son de NASA: hay que respetar sus condiciones de uso.
- Cómo citar lo que viene de Google Earth Engine: «NASA MODIS MOD11A2 v061, accedido vía Google Earth Engine».

## Entrega
- Cierre: **domingo 15-11-2026 a las 23:59**, hora del evento local.
- Todo **en inglés**. Si el vídeo se habla en otro idioma, lleva subtítulos en inglés.
- Demo: **vídeo de 30 s como máximo** o **7 diapositivas como máximo**. Si se excede, el proyecto no pasa a la fase global.
- Enlaces públicos, sin login ni permisos.
- Hay que marcar «Terms and Conditions» y «Confirm All Work is Original».

## IA («Super Intelligence», SI)
- Está permitida como herramienta, **pero no para tener la idea** de cómo resolver el reto.
- Hay que declarar cómo se ha usado.
- Imágenes y vídeos generados: marca de agua visible.
- Código y datos generados: indicarlo en el texto y en los metadatos.
- Lo generado con IA no puede llevar logos ni marcas de NASA.

## Jurado
Cinco criterios, cada uno de 1 a 5: **Impact, Creativity, Validity, Relevance, Presentation**.

## Vídeo de demo: decisiones del equipo (15-11-2026)
Comprobado de nuevo el 15-11. La página de la guía no se pudo volver a abrir (fallo de certificado en la red), pero las búsquedas confirman los límites: 30 s o menos, subtítulos en inglés, enlace público.
- **Duración:** menos de 30 s. La voz ocupa los 30 s (`docs/timestamps.txt`), así que el archivo se corta a **29,9 s** para que ningún reproductor lo redondee por encima de 30.
- **Formato:** horizontal, 16:9 (1920×1080). Se enseña la pantalla tal cual, sin marco de móvil.
- **Audio y subtítulos en inglés.** Subtítulos quemados en la imagen, idénticos a la locución (el jurado puede verlo sin sonido). Estilo: **palabra a palabra, acumulándose** (cada palabra aparece cuando se dice, con un ligero «pop», y la frase se queda hasta el final de su tramo); amarillo, sin caja, contorno oscuro, **Nimbus Sans** (clon de Helvetica) en negrita a 44 px. Tiempos de cada palabra sacados de la voz con Vosk (`video/audio/word-timings.json`).
- **Marca de agua de SI** pequeña y visible durante todo el vídeo, que diga que la edición se hizo con ayuda de SI y que la voz está generada con **ElevenLabs** (nombrado explícitamente). Texto: `SI-assisted editing · SI voice: ElevenLabs` (se usa «SI», el término de las normas, no «AI»).
- Sin logos ni marcas de NASA en nada generado con IA. Las imágenes de datos de NASA dentro de la web (GIBS, Trek) sí pueden salir.
- ElevenLabs y cualquier música van en «Space Agency Partner Data and Other References» y en «Use of SI».
- **Cada plano tiene que servir a algún criterio del jurado** (Impact, Creativity, Validity, Relevance, Presentation). Ver el mapa de criterios en `docs/guion-video.md`.
- Pendiente de confirmar a mano: la sección «Use of SI» de la guía (por si dice algo del audio) y si el evento de Barcelona tiene normas locales.
