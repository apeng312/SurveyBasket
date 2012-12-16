    google.load('visualization', '1.0', {'packages':['corechart']});
      function drawChart() {

        // Create the data table.
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Options');
        data.addColumn('number', 'Count');
        var number_of_questions = $(".one-question").length;
        for (var i=0; i < number_of_questions; i++) {
            console.log(number_of_questions);
            console.log("i is"+i);
            var type = $("#type"+i).html();
            if (type === "multiple_choice") {
                var result = JSON.parse($("#result"+i).html());
                console.log(result);
                if (result.length === 0) {
                    $("#chart"+i).html("No response received yet");
                }
                else {
                    data.addRows(convert_obj_to_2darray(result));
                    // Set chart options
                    var options = {'width':300,
                                   'height':200};
                    // Instantiate and draw our chart, passing in some options.
                    var chart = new google.visualization.PieChart(document.getElementById("chart"+i));
                    $("#chart"+i).removeClass("alert");
                    chart.draw(data, options);
                }
            }
        }
      }
      
      function convert_obj_to_2darray(obj) {
            /* It is important to parse it because it was obtained from
            the html which was JSON.stringified before */
            //var object = JSON.parse(obj);
            var result = []
            for (var key in obj) {
                result.push([key, obj[key]]);
            }
            return result;
      }
