geotab.addin.reporteGasoleo = () => {
    return {
        initialize(api, state, callback) {
            const btnConsultar = document.getElementById("btnConsultar");
            
            btnConsultar.addEventListener("click", async () => {
                const year = document.getElementById("yearSelect").value;
                const trucks = await api.call("Get", { typeName: "Device" });
                
                // Definir las fechas límite del año
                const fromDate = `${year}-01-01T00:00:00.000Z`;
                const toDate = `${year}-12-31T23:59:59.000Z`;

                const results = [];

                for (let truck of trucks) {
                    // Llamada para obtener el odómetro de inicio y fin de año
                    // Nota: DiagnosticOdometerId es el oficial del tacógrafo en Geotab
                    const statusData = await api.call("Get", {
                        typeName: "StatusData",
                        search: {
                            deviceSearch: { id: truck.id },
                            diagnosticSearch: { id: "DiagnosticOdometerId" },
                            fromDate: fromDate,
                            toDate: toDate
                        }
                    });

                    if (statusData.length > 1) {
                        const odoIni = statusData[0].data / 1000; // Convertir metros a km
                        const odoFin = statusData[statusData.length - 1].data / 1000;
                        const total = odoFin - odoIni;

                        results.push({
                            name: truck.name,
                            plate: truck.licensePlate,
                            inicio: odoIni.toFixed(2),
                            fin: odoFin.toFixed(2),
                            total: total.toFixed(2)
                        });
                    }
                }
                renderTable(results);
            });

            callback();
        }
    };
};

function renderTable(data) {
    const tbody = document.querySelector("#resultTable tbody");
    tbody.innerHTML = "";
    data.forEach(item => {
        tbody.innerHTML += `<tr>
            <td>${item.name}</td>
            <td>${item.plate}</td>
            <td>${item.inicio}</td>
            <td>${item.fin}</td>
            <td>${item.total}</td>
        </tr>`;
    });
    document.getElementById("btnExportar").style.display = "block";
}