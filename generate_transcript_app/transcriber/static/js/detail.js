var follow = true
var videoPlayer = $("#player")
var captions_container = $("#captions_container")
var btn_close_modal = $("#btn_close_modal")
var session_data = null
var there_are_unsaved_changes = false


function parseTime(time_str) {
  /** Returns the amount of seconds for a duration in format:
   * - MM:SS.xxx
   * */
  let mm, ss, clean_time_str
  clean_time_str = time_str.split(".")[0]
  mm = parseInt(clean_time_str.split(":")[0])
  ss = parseInt(clean_time_str.split(":")[1])
  return mm * 60 + ss
}


function parseVTTline(vtt_line) {
/** Returns a JSON object from a VTT line.
 * The JSON object contains the following parameters:
 * - start_time
 * - end_time
 * - text
 * */
  let tl, times, text, start_time, end_time;
  tl = vtt_line.split("\n")

  times = tl[0];
  text = tl[1].trim();

  start_time = parseTime(times.split(" --> ")[0])
  end_time = parseTime(times.split(" --> ")[1])

  return {
    "start_time": start_time,
    "end_time": end_time,
    "text": text
  };
}


function jumpTo(el){
  /** Auto-scrolls caption section to follow passed element
   * */
  let scrollTop = el[0].offsetTop + el.height() - captions_container.height()
  captions_container[0].scrollTop = scrollTop
}


function videoUpdate() {
  /** On timeupdate, updates caption list to color the one 
   * that is currently being played and triggers auto-scroll if enabled.
   * TODO: use session_data instead of iterating through elements
   * */
  let current_time = videoPlayer[0].currentTime
  $("li").each(idx => {
    let caption_item = $("#caption-"+idx)
    let start_time = parseInt(caption_item.data("start-time"))
    let end_time = parseInt(caption_item.data("end-time"))

    if (
      start_time < current_time &&
      end_time > current_time
    ) {
      if (follow == true && !caption_item.hasClass("active")) {
        // only jump if enabled and if we changed captions
        jumpTo(caption_item)
      }
      caption_item.addClass("active")
    } else {
      caption_item.removeClass("active")
    }
  })
}


function goToCaptionInVideo(caption_time) {
  /** Updates video.currentTime with caption_time.
   * */
  videoPlayer[0].pause()
  videoPlayer[0].currentTime = parseInt(caption_time)
  videoPlayer[0].play()
}


function toggleFolow() {
  /** Toggles follow flag and changes button appearance.
   * */
  follow = !follow

  $("#toggle_follow").html(
      follow ? "Disable follow" : "Enable follow"
  )
  $("#toggle_follow").toggleClass("btn-info")
  $("#toggle_follow").toggleClass("btn-outline-info")
}


function updateDropDownHTMLSpeakersList() {
  /** Updates drop down HTML with speakers list from session_data.
   * */
  if (Object.keys(session_data.speakers).length == 0) {
    return
  }

  $(".spokespeople_list").each((idx, el) => {
    let speakers_html = []
    for (const key in session_data.speakers) {
      speakers_html.push(
        "<div><button class='dropdown-item' onclick='setSpeakerForCaption("+idx+","+key+")'>"+session_data.speakers[key]+"</button></div>"
      )
    }
    speakers_html = speakers_html.join("")
    $(el).html(speakers_html)
  })
}


function updateHTMLSpeakerForCaption() {
  /** Updates captions' assigned speaker from session_data.
   * */
  if (Object.keys(session_data.speakers).length == 0) {
    return
  }

  session_data.captions.forEach(caption => {
    if (caption.speaker == null) {
      return
    }

    let spokesperson_btn = $("#caption_spokesperson-" + (caption.index || '0'))

    spokesperson_btn.html(session_data.speakers[caption.speaker])
    spokesperson_btn.removeClass("btn-outline-success")
    spokesperson_btn.addClass("btn-success")
  })
}


function setSpeakerForCaption(caption_index, speaker_index) {
  /** Stores in session storage the speaker index for the caption.
   * Triggers update HTML speaker for all captions.
   * */
  if (Object.keys(session_data.speakers).length == 0) {
    console.log("No speakers to set... This is weird.")
    return
  }

  session_data.captions[caption_index].speaker = speaker_index
  sessionStorage.setItem("session_data", JSON.stringify(session_data))
  there_are_unsaved_changes = true

  updateHTMLSpeakerForCaption()
}


function addSpeaker() {
  /** Stores in session storage the new speaker if it didn't exist already.
   * Triggers update dropdown HTML for all captions.
   * */
  let spokesperson_name_input = $("#spokesperson_name")[0]
  let spokesperson_name = spokesperson_name_input.value
  btn_close_modal.click()
  spokesperson_name_input.value = ""

  if (spokesperson_name.trim() == "") {
    alert("Please, provide a valid name.")
    return
  }

  for (const speaker_index in session_data) {
    if (session_data[speaker_index] == spokesperson_name) {
      alert("That speaker already exists.")
      return
    }
  }

  session_data.speakers[Object.keys(session_data.speakers).length] = spokesperson_name
  sessionStorage.setItem("session_data", JSON.stringify(session_data))
  there_are_unsaved_changes = true

  updateDropDownHTMLSpeakersList()
}


function updateCaptionText(caption_index) {
  let text = $("#caption-input-" + (caption_index || "0")).val()
  session_data.captions[caption_index].text = text
  sessionStorage.setItem("session_data", JSON.stringify(session_data))
  there_are_unsaved_changes = true
}


function getScriptForPDF() {
  let header = `<h1 class="text-black">${$("#page-title").html()}</h1>`

  // merge captions if they have the same speaker
  let captions = [session_data.captions[0]]
  session_data.captions.slice(1).forEach(caption => {
    if (
      caption.speaker != null &&
      captions[captions.length-1].speaker == caption.speaker
    ) {
      captions[captions.length-1].text += " " + caption.text
      return
    }
    captions.push(caption)
  })

  return header + captions.map(caption => {
    let speaker = "(Unknown)"
    if (caption.speaker != null) {
      speaker = session_data.speakers[caption.speaker]
    }

    return `<p class="text-black"><b>${speaker}</b>: ${caption.text}</p>`
  }).join("")
}


$("#generate_report").click(() => {
  const page = getScriptForPDF()
  const filename = $("#page-title").html().replace(" - ", "_") + ".pdf"
  let opt = {
    margin: 1,
    filename: filename,
    image: {type: 'jpeg', quality: 0.98 },
    html2canvas: {scale: 2 },
    jsPDF: {
      unit: 'in',
      format: 'letter',
      orientation: 'portrait' 
    }
  }
  html2pdf().set(opt).from(page).save()
})


$("#go_back").click(() => {
  let go_back = false
  if (there_are_unsaved_changes) {
      go_back = confirm(
        "You will lose all your progress if you go back.\nPlease save a local copy if you haven't done already.\nContinue?"
      ) == true
  } else {
    go_back = true
  }

  if (go_back) {
    session_data = null
    sessionStorage.clear()
    location.replace("/")
  }
})

$("#save_status").click(() => {
  let save_status_json = {"json_save": JSON.stringify(session_data)} 
  let csrf_token = $('input[name="csrfmiddlewaretoken"]').val()
  Object.assign(save_status_json, session_data, {"csrfmiddlewaretoken": csrf_token})

  $.post(location.href, save_status_json, (data, status) => {
    alert("Data: " + data + "\nStatus: " + status)
    if (status == "success") {
      there_are_unsaved_changes = false
    }
  })
})

$(document).ready(() => {
  videoPlayer.bind('timeupdate', videoUpdate);

  // recover session information
  let json_save = $("#json_save").html()
  session_data = sessionStorage.getItem("session_data")
  if (session_data != null) {
    session_data = JSON.parse(session_data)
    if (session_data.file != $("h1#page-title").html()) {
      // to make sure we are using the right value for the current page.
      session_data = null
      sessionStorage.clear()
    }
  }

  // try to restore session from db data
  if (session_data == null && json_save != "") {
    try {
      session_data = JSON.parse(json_save)
    } catch (error) {
      console.log("Error parsing DB json save")
      console.error(error)
    }
  }

  // we have no data to restore, let's create a new session_data
  if (session_data == null) {
    session_data = {
      "speakers": {},
      "captions": [],
      "file": $("h1#page-title").html()
    }

    // parse VTT info from HTML
    let vtt_transcriptions = captions_container.text()
    captions_container.html("")

    let index = 0;
    vtt_transcriptions.split("\n\n").slice(1).forEach(x => {
      let clean_vtt_line 
      try {
        clean_vtt_line = parseVTTline(x)
      } catch(e) {
        return;
      }

      if (clean_vtt_line.start_time && clean_vtt_line.end_time && clean_vtt_line.text)
        clean_vtt_line.index = index
        session_data.captions.push(clean_vtt_line)
        index++
    })
    sessionStorage.setItem("session_data", JSON.stringify(session_data))
    there_are_unsaved_changes = true
  }

  // update HTML with captions info
  captions_container.html(session_data.captions.map(x => {
    let idx = (x.index || '0')
    return ""+
    "<li id='caption-" + idx +
    "' class='list-group-item' data-start-time='" + x.start_time +
    "' data-end-time='" + x.end_time +
    "'>" +
    "<div class='input-group'>" +
      "<div class='btn-group' role='group' aria-label='Caption options'>" +
        "<button type='button' class='btn btn-outline-warning' onclick='goToCaptionInVideo("+x.start_time+")'>Go</button>" +
        "<button type='button' class='btn btn-outline-info visually-hidden'>Add comment</button>" +

        "<div class='btn-group' role='group'>" +
          "<button id='caption_spokesperson-"+(idx)+"' type='button' class='btn btn-outline-success dropdown-toggle' data-bs-toggle='dropdown' aria-expanded='false'>" +
          "</button>" +
          "<div class='dropdown-menu spokespeople_list'></div>" +
        "</div>" +
      "</div>" +
      "<span>&nbsp;</span>" +
      "<input id='caption-input-"+idx+"' type='text' class='form-control' onchange='updateCaptionText("+idx+")' value=\""+ x.text +"\"/>" +
    "</div>" +
    "</li>";
  }))

  updateDropDownHTMLSpeakersList()
  updateHTMLSpeakerForCaption()
})
