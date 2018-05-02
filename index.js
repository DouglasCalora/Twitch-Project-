var App = function() {
  this.channels = {}

  this.setChannels = function(channels) {
    this.twitchChannels = channels || [] 
  }

  this.twitchApi = function(path, callback) {
    if (!path) {
      throw new Error('É necessário informar um path.')
    } 

    var request = new XMLHttpRequest()

    request.onload = function() {
      var response = JSON.parse(request.response)

      if (typeof callback === 'function') { 
        callback(response)
      }
    }
    
    request.onerror = function() {
      throw new Error('Erro na api')
    } 

    request.open('GET', 'https://wind-bow.glitch.me/twitch-api/' + path)
    request.send()
  }

  this.getChannelsDetails = function(callback) {
    var self = this
    var total = this.twitchChannels.length
    var counter = 0

    this.twitchChannels.forEach(function(channel) {
      self.twitchApi('channels/' + channel, function(response) {
        counter++

        if (response.status == 404) { 
          return
        }

        self.channels[channel] = response

        if (typeof callback === 'function' && counter >= total ) {
          callback()  
        }      
      })
    }) 
  } 

  this.updateChannelsStatus = function(callback) {
    var self = this
    var total = this.twitchChannels.length
    var counter = 0

    this.twitchChannels.forEach(function(channel) {
      self.twitchApi('streams/' + channel, function(response) {
        counter++  
        self.channels[channel].stream = response 
  
        if (typeof callback === 'function' && counter >= total) {
          callback() 
        }
      })
    })
  }   
}

document.addEventListener('DOMContentLoaded', function() {
  var app = new App()
  var element = document.getElementById('table')
  var filterButtons = document.querySelectorAll('[data-filter]')
  var filterStatus = 'all'
  
  function clearResults() {
    element.innerHTML = ''
  }

  function generateChannel(channel) {
    var status = ''

    if (channel.stream) {
      status = channel.stream.stream ? 'on'  : 'off'
    }
    
    return '<tr>' 
         + '<td scope="col float-left" style="margin: 0px"> <img src="' + channel.logo + '" class="rounded-circle"> </th>'
         + '<td scope="col"> <a href="' + channel.url +'" target="_blank"><h5>' + channel.name + '</h5></a> </th>'
         + '<td id="' + channel.display_name + '" scope="col" style="background: ' + (status == 'on' ? 'green' : 'red') + '">' + status + '</th>'
         + '</tr>'
  }

  function populateResults() {
    app.getChannelsDetails(function() {
      for (var i in app.channels) {
        element.insertAdjacentHTML('beforeend', generateChannel(app.channels[i]))
      }

      app.updateChannelsStatus(function() {  
        for (var i in app.channels) {
          var elementTd = document.getElementById(app.channels[i].display_name)

          if (app.channels[i].stream.stream ==  null) {      
            elementTd.innerHTML = 'off'
            elementTd.style.background = 'red' 
          } else {         
            elementTd.innerHTML = 'on'
            elementTd.style.background = 'green'
          }
        }
      })
    })
  }

  app.setChannels(['ESL_SC2', 'OgamingSC2', 'cretetion', 'freecodecamp', 'storbeck', 'habathcx', 'RobotCaleb', 'noobs2ninjas'])

  for (var index = 0; index < filterButtons.length; index++) {
    filterButtons[index].addEventListener('click', function() {
      var filter = this.dataset.filter
      var active = document.querySelector('.btn-primary[data-filter]')

      active.classList.remove('btn-primary')
      this.classList.add('btn-primary')
      
      clearResults()
  
      for (var i in app.channels) {
        var status = app.channels[i].stream.stream != null ? 'on' : 'off'
    
        if (filter == 'all' || filter == status) {
          element.insertAdjacentHTML('beforeend', generateChannel(app.channels[i]))
        }
      }
    })
  }

  populateResults() 
})