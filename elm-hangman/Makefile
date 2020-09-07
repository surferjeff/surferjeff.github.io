ELM_MAKE_FLAGS = 

.PHONY=all
all: public/index.html public/elm.js

release: ELM_MAKE_FLAGS += --optimize
release: all

debug: ELM_MAKE_FLAGS += --debug
debug: all

public/index.html: public/elm.js

public/elm.js: $(wildcard src/*.elm)
	elm make $(ELM_MAKE_FLAGS) src/Main.elm --output=public/elm.js

.PHONY=clean
clean:
	rm public/elm.js

.PHONY=run
run: public/elm.js public/index.html
	open public/index.html