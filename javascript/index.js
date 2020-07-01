mapboxgl.accessToken =
  "pk.eyJ1IjoibWNmd2VzaCIsImEiOiJja2J4anB0Mmswb3pwMndtb29rYnZkcnhpIn0.5AAPN4_WcSQMVavea0eWqQ";

let map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v10",
  center: [11.020224806180178, 50.983252690673254],
  zoom: 6,
});

map.addControl(new mapboxgl.NavigationControl());

//Load Map
map.on("load", () => {
  //points
  map.addSource("points", {
    type: "geojson",
    data: "https://mcfwesh.github.io/geospatial-data/points.json",
    cluster: true,
  });
  map.addLayer({
    id: "points",
    type: "circle",
    source: "points",
    filter: ["!=", "cluster", true],
    paint: {
      "circle-color": "red",
      "circle-stroke-color": "#000",
      "circle-stroke-width": 1,
      "circle-radius": 6,
    },
    layout: {
      visibility: "visible",
    },
  });

  //states
  map.addSource("germany", {
    type: "geojson",
    data: "https://mcfwesh.github.io/geospatial-data/states.json",
    generateId: true,
  });

  map.addLayer({
    id: "states-color",
    type: "fill",
    source: "germany",
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": {
        type: "identity",
        property: "color",
      },
      "fill-outline-color": [
        "case",
        ["boolean", ["feature-state", "clicked"], false],
        "#ffffff",
        "#888888",
      ],
      "fill-opacity": 0.5,
    },
    filter: ["==", "$type", "Polygon"],
  });

  map.addLayer({
    id: "states-color-line",
    type: "line",
    source: "germany",
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": "#ffffff",
      "line-width": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        2,
        0,
      ],
    },
    filter: ["==", "$type", "Polygon"],
  });

  //toggle states-color outline
  map.on("mousemove", "states-color", function (e) {
    if (e.features.length > 0) {
      if (typeof stateID === "number") {
        map.removeFeatureState({
          source: "germany",
          id: stateID,
        });
      }
      stateID = e.features[0].id;

      map.setFeatureState(
        {
          source: "germany",
          id: stateID,
        },
        {
          hover: true,
        }
      );
    }
  });

  map.on("mouseleave", "states-color", function (e) {
    if (typeof stateID === "number") {
      map.removeFeatureState({
        source: "germany",
        id: stateID,
      });
    }
    stateID = null;
  });

  map.addLayer({
    id: "states-number",
    type: "symbol",
    source: "germany",
    layout: {
      visibility: "none",
      "text-field": "{number}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 20,
    },
    paint: {
      "text-color": "#ffffff",
    },
  });

  map.addLayer({
    id: "states-area",
    type: "symbol",
    source: "germany",
    layout: {
      visibility: "none",
      "text-field": "{area}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 10,
    },
    paint: {
      "text-color": "#ffffff",
    },
  });

  let popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });
  let filterDiv = document.createElement("div");
  filterDiv.textContent = "Filter By:";

  let layers = document.getElementById("menu");
  layers.appendChild(filterDiv);

  map.on("mouseenter", "points", function (e) {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = "pointer";

    let coordinates = e.features[0].geometry.coordinates.slice();
    let name1 = e.features[0].properties.NAME_1;
    let name2 = e.features[0].properties.NAME_2;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // Populate the popup and set its coordinates
    // based on the feature found.
    popup
      .setLngLat(coordinates)
      .setHTML("<h3>" + name1 + "</h3><p>" + name2 + "</p>")
      .addTo(map);
  });

  map.on("mouseleave", "points", function () {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });

  //toggling Points visibliity
  // enumerate ids of the layers
  let toggleableLayerIds = [
    "points",
    "states-color",
    "states-area",
    "states-number",
  ];

  // set up the corresponding toggle button for each layer
  for (let i = 0; i < toggleableLayerIds.length; i++) {
    let id = toggleableLayerIds[i];

    let link = document.createElement("a");
    link.href = "#";
    link.className = id === "states-color" || id === "points" ? "active" : "";
    link.textContent = id;

    link.onclick = function (e) {
      let clickedLayer = this.textContent;
      e.preventDefault();
      e.stopPropagation();

      let visibility = map.getLayoutProperty(clickedLayer, "visibility");

      // toggle layer visibility by changing the layout object's visibility property
      if (visibility === "visible") {
        this.className = "";
        map.setLayoutProperty(clickedLayer, "visibility", "none");
      } else {
        map.setLayoutProperty(clickedLayer, "visibility", "visible");
        this.className = "active";
      }
    };

    layers.appendChild(link);
  }
});
